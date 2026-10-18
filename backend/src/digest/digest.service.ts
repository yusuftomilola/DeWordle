import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { EmailService } from '../auth/email.service';
import { GameSession } from '../game-sessions/entities/game-session.entity';
import { DigestDelivery } from './digest-delivery.entity';
import { DigestTemplate } from './digest-template.entity';
import {
  DEFAULT_DIGEST_HTML,
  DEFAULT_DIGEST_SUBJECT,
  renderDigestTemplate,
  validateDigestTemplate,
} from './digest-template';
import {
  buildDigestStats,
  describeRankChange,
  weekStartOf,
  type UserWeekRow,
} from './digest-stats';

export const DIGEST_CRON = '0 9 * * 1'; // Mondays 09:00
const DAY_MS = 86_400_000;
const ACTIVE_WINDOW_DAYS = 30;

export interface DigestRunSummary {
  weekStart: string;
  eligible: number;
  sent: number;
  failed: number;
  skipped: number;
}

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(GameSession)
    private readonly sessions: Repository<GameSession>,
    @InjectRepository(DigestTemplate)
    private readonly templates: Repository<DigestTemplate>,
    @InjectRepository(DigestDelivery)
    private readonly deliveries: Repository<DigestDelivery>,
    private readonly email: EmailService,
  ) {}

  @Cron(DIGEST_CRON, { name: 'weekly-digest', timeZone: 'UTC' })
  async handleWeeklyDigest(): Promise<void> {
    try {
      await this.sendWeeklyDigest();
    } catch (error) {
      this.logger.error(
        `weekly digest run failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  async getTemplate(): Promise<{ subject: string; bodyHtml: string }> {
    const stored = await this.templates.findOne({ where: { id: 1 } });
    return stored
      ? { subject: stored.subject, bodyHtml: stored.bodyHtml }
      : { subject: DEFAULT_DIGEST_SUBJECT, bodyHtml: DEFAULT_DIGEST_HTML };
  }

  async updateTemplate(subject: string, bodyHtml: string, updatedBy: string) {
    const problem = validateDigestTemplate(subject, bodyHtml);
    if (problem) throw new BadRequestException(problem);
    await this.templates.save({ id: 1, subject, bodyHtml, updatedBy });
    return { subject, bodyHtml };
  }

  /** Sends the digest for the week ending at the most recent Monday 00:00 UTC. */
  async sendWeeklyDigest(now: Date = new Date()): Promise<DigestRunSummary> {
    const weekStart = weekStartOf(now);
    const windowEnd = new Date(`${weekStart}T00:00:00Z`);
    const windowStart = new Date(windowEnd.getTime() - 7 * DAY_MS);
    const activeSince = new Date(windowEnd.getTime() - ACTIVE_WINDOW_DAYS * DAY_MS);

    const rows = await this.loadWeekRows(windowStart, windowEnd, activeSince);
    const daysByUser = await this.loadPlayedDays(activeSince, windowEnd);
    const today = new Date(windowEnd.getTime() - DAY_MS).toISOString().slice(0, 10);
    const template = await this.getTemplate();

    const optedIn = await this.users.find({ where: { digestOptIn: true } });
    const byId = new Map(optedIn.map((u) => [u.id, u]));
    const summary: DigestRunSummary = {
      weekStart,
      eligible: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    for (const row of rows.filter((r) => r.active)) {
      const user = byId.get(row.userId);
      if (!user) continue; // opted out or deleted
      summary.eligible += 1;

      const already = await this.deliveries.findOne({
        where: { userId: user.id, weekStart },
      });
      if (already?.status === 'sent') {
        summary.skipped += 1;
        continue;
      }

      const stats = buildDigestStats(
        row,
        rows,
        daysByUser.get(row.userId) ?? [],
        today,
      );
      const html = renderDigestTemplate(template.bodyHtml, {
        name: user.username || user.email,
        gamesPlayed: String(stats.gamesPlayed),
        winRate: `${stats.winRate}%`,
        streak: `${stats.streak} day${stats.streak === 1 ? '' : 's'}`,
        rank: `#${stats.rank}`,
        rankChange: describeRankChange(stats.rankChange),
      });
      const subject = renderDigestTemplate(template.subject, {
        name: user.username || user.email,
        gamesPlayed: String(stats.gamesPlayed),
        winRate: `${stats.winRate}%`,
        streak: String(stats.streak),
        rank: `#${stats.rank}`,
        rankChange: describeRankChange(stats.rankChange),
      });

      try {
        const accepted = await this.email.sendMail(user.email, subject, html);
        if (!accepted) throw new Error('email transport rejected the message');
        await this.record(user.id, weekStart, 'sent', null);
        summary.sent += 1;
      } catch (error) {
        await this.record(user.id, weekStart, 'failed', (error as Error).message);
        summary.failed += 1;
      }
    }

    this.logger.log({ msg: 'digest.run.completed', ...summary });
    return summary;
  }

  private async record(
    userId: number,
    weekStart: string,
    status: 'sent' | 'failed',
    error: string | null,
  ) {
    // Upsert so a retry after an earlier failed attempt replaces that row.
    await this.deliveries.upsert({ userId, weekStart, status, error }, [
      'userId',
      'weekStart',
    ]);
    this.logger.log({ msg: 'digest.delivery', userId, weekStart, status, error });
  }

  private async loadWeekRows(
    start: Date,
    end: Date,
    activeSince: Date,
  ): Promise<(UserWeekRow & { active: boolean })[]> {
    const raw: Record<string, string>[] = await this.sessions.query(
      `SELECT "userId" AS "userId",
              COUNT(*) FILTER (WHERE status = 'WON' AND "playedAt" < $2) AS "winsTotal",
              COUNT(*) FILTER (WHERE status = 'WON' AND "playedAt" < $1) AS "winsBeforeWeek",
              COUNT(*) FILTER (WHERE status <> 'IN_PROGRESS' AND "playedAt" >= $1 AND "playedAt" < $2) AS "playedWeek",
              COUNT(*) FILTER (WHERE status = 'WON' AND "playedAt" >= $1 AND "playedAt" < $2) AS "winsWeek",
              COUNT(*) FILTER (WHERE status <> 'IN_PROGRESS' AND "playedAt" >= $3 AND "playedAt" < $2) AS "recent"
         FROM game_session
        WHERE "userId" IS NOT NULL
        GROUP BY "userId"`,
      [start, end, activeSince],
    );
    return raw.map((r) => ({
      userId: Number(r.userId),
      winsTotal: Number(r.winsTotal),
      winsBeforeWeek: Number(r.winsBeforeWeek),
      playedWeek: Number(r.playedWeek),
      winsWeek: Number(r.winsWeek),
      active: Number(r.recent) > 0,
    }));
  }

  private async loadPlayedDays(since: Date, end: Date): Promise<Map<number, string[]>> {
    const raw: { userId: number; day: string }[] = await this.sessions.query(
      `SELECT "userId" AS "userId", to_char("playedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day
         FROM game_session
        WHERE "userId" IS NOT NULL AND status <> 'IN_PROGRESS'
          AND "playedAt" >= $1 AND "playedAt" < $2
        GROUP BY 1, 2`,
      [since, end],
    );
    const map = new Map<number, string[]>();
    for (const { userId, day } of raw) {
      const id = Number(userId);
      map.set(id, [...(map.get(id) ?? []), day]);
    }
    return map;
  }
}
