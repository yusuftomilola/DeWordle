/**
 * Integration tests for leaderboard ranking against a real PostgreSQL database.
 *
 * Set LEADERBOARD_TEST_DATABASE_URL (or DATABASE_URL) to a postgres URL, for
 * example `postgresql://test:test@localhost:5432/test`. Each run creates its
 * own schema and drops it afterwards, so it is safe to point at a shared
 * database. Without a URL the suite is skipped.
 */
// @nestjs/swagger 12 is ESM-only and cannot be loaded by this CommonJS jest
// setup. The entities only use it for API documentation decorators, which
// have no effect on persistence, so stub it for this suite.
jest.mock('@nestjs/swagger', () => ({
  ApiProperty: () => () => undefined,
  ApiPropertyOptional: () => () => undefined,
}));
// The service is constructed by hand with a real repository below, so the
// Nest DI decorator (which cannot be loaded here either) is not needed.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DataSource, type Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { LeaderboardEntry } from './leaderboard-entry.entity';
import { LeaderboardService } from './leaderboard.service';
import { User } from '../auth/entities/user.entity';
import { Game } from '../games/entities/game.entity';
import { GameSession } from '../game-sessions/entities/game-session.entity';
import { GuessHistory } from '../game-sessions/entities/guess-history.entity';

const DATABASE_URL =
  process.env.LEADERBOARD_TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const describeDb = DATABASE_URL?.startsWith('postgres')
  ? describe
  : describe.skip;

describeDb('Leaderboard ranking (PostgreSQL integration)', () => {
  const schema = `leaderboard_it_${randomBytes(4).toString('hex')}`;
  let dataSource: DataSource;
  let users: Repository<User>;
  let games: Repository<Game>;
  let entries: Repository<LeaderboardEntry>;
  let service: LeaderboardService;
  let game: Game;

  /** Seeds one player with fixed stats and an explicit `lastUpdated` time. */
  async function seed(
    name: string,
    stats: { score: number; wins: number; sessions: number },
    lastUpdated: string,
    forGame: Game = game,
  ): Promise<User> {
    const existing = await users.findOne({
      where: { email: `${name}@example.test` },
    });
    const user =
      existing ??
      (await users.save(
        users.create({
          email: `${name}@example.test`,
          password: 'not-a-real-hash',
          username: name,
        }),
      ));
    const entry = await entries.save(
      entries.create({
        user,
        game: forGame,
        totalScore: stats.score,
        wins: stats.wins,
        totalSessions: stats.sessions,
      }),
    );
    // @UpdateDateColumn is set by the database on save; pin it for determinism.
    await entries.update(entry.id, { lastUpdated: new Date(lastUpdated) });
    return user;
  }

  beforeAll(async () => {
    const admin = new DataSource({ type: 'postgres', url: DATABASE_URL });
    await admin.initialize();
    await admin.query(`CREATE SCHEMA "${schema}"`);
    await admin.destroy();

    dataSource = new DataSource({
      type: 'postgres',
      url: DATABASE_URL,
      schema,
      entities: [User, Game, GameSession, GuessHistory, LeaderboardEntry],
      synchronize: true,
    });
    await dataSource.initialize();
    users = dataSource.getRepository(User);
    games = dataSource.getRepository(Game);
    entries = dataSource.getRepository(LeaderboardEntry);
    service = new LeaderboardService(entries);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.query(
      `TRUNCATE TABLE "${schema}"."leaderboard_entry", "${schema}"."users", "${schema}"."games" RESTART IDENTITY CASCADE`,
    );
    game = await games.save(
      games.create({
        slug: 'dewordle',
        name: 'DeWordle',
        description: 'Daily word game',
        type: 'word',
      }),
    );
  });

  describe('per-game ranking order', () => {
    it('orders players by total score, highest first', async () => {
      await seed(
        'mid',
        { score: 300, wins: 3, sessions: 4 },
        '2026-03-01T10:00:00Z',
      );
      await seed(
        'top',
        { score: 900, wins: 8, sessions: 9 },
        '2026-03-01T10:00:00Z',
      );
      await seed(
        'low',
        { score: 100, wins: 1, sessions: 5 },
        '2026-03-01T10:00:00Z',
      );

      const board = await service.getGameLeaderboard(game);

      expect(board.map((e) => e.user.username)).toEqual(['top', 'mid', 'low']);
      expect(board.map((e) => e.totalScore)).toEqual([900, 300, 100]);
    });

    it('breaks equal scores by the most recent update', async () => {
      await seed(
        'older',
        { score: 500, wins: 5, sessions: 6 },
        '2026-03-01T08:00:00Z',
      );
      await seed(
        'newest',
        { score: 500, wins: 5, sessions: 6 },
        '2026-03-03T08:00:00Z',
      );
      await seed(
        'middle',
        { score: 500, wins: 5, sessions: 6 },
        '2026-03-02T08:00:00Z',
      );

      const board = await service.getGameLeaderboard(game);

      expect(board.map((e) => e.user.username)).toEqual([
        'newest',
        'middle',
        'older',
      ]);
    });

    it('ranks by score before recency, whatever the win counts are', async () => {
      await seed(
        'score-wins',
        { score: 400, wins: 2, sessions: 2 },
        '2026-03-01T00:00:00Z',
      );
      await seed(
        'score-recent',
        { score: 350, wins: 9, sessions: 9 },
        '2026-03-09T00:00:00Z',
      );

      const board = await service.getGameLeaderboard(game);

      expect(board.map((e) => e.user.username)).toEqual([
        'score-wins',
        'score-recent',
      ]);
    });

    it('only includes entries for the requested game', async () => {
      const other = await games.save(
        games.create({
          slug: 'other',
          name: 'Other',
          description: 'x',
          type: 'word',
        }),
      );
      await seed(
        'here',
        { score: 10, wins: 1, sessions: 1 },
        '2026-03-01T00:00:00Z',
      );
      await seed(
        'there',
        { score: 999, wins: 9, sessions: 9 },
        '2026-03-01T00:00:00Z',
        other,
      );

      const board = await service.getGameLeaderboard(game);

      expect(board.map((e) => e.user.username)).toEqual(['here']);
    });

    it('is empty for a game with no players', async () => {
      expect(await service.getGameLeaderboard(game)).toEqual([]);
    });
  });

  describe('upsertEntry accumulates stats', () => {
    it('creates an entry and then accumulates score, wins and sessions', async () => {
      const user = await users.save(
        users.create({
          email: 'acc@example.test',
          password: 'x',
          username: 'acc',
        }),
      );
      await service.upsertEntry(user, game, 100, true);
      await service.upsertEntry(user, game, 50, false);
      await service.upsertEntry(user, game, 25, true);

      const [row] = await service.getGameLeaderboard(game);
      expect(row).toMatchObject({ totalScore: 175, wins: 2, totalSessions: 3 });
      expect(await entries.count()).toBe(1);
    });
  });

  describe('pagination', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 7; i++) {
        // Distinct scores 700, 600, ... 100 give a fully determined order.
        await seed(
          `p${i}`,
          { score: (8 - i) * 100, wins: i, sessions: 10 },
          '2026-03-01T00:00:00Z',
        );
      }
    });

    it('returns the requested page', async () => {
      const page1 = await service.getGameLeaderboard(game, 0, 3);
      const page2 = await service.getGameLeaderboard(game, 3, 3);
      const page3 = await service.getGameLeaderboard(game, 6, 3);

      expect(page1.map((e) => e.user.username)).toEqual(['p1', 'p2', 'p3']);
      expect(page2.map((e) => e.user.username)).toEqual(['p4', 'p5', 'p6']);
      expect(page3.map((e) => e.user.username)).toEqual(['p7']);
    });

    it('pages never overlap and together cover every player once', async () => {
      const seen: string[] = [];
      for (let skip = 0; skip < 10; skip += 2) {
        const page = await service.getGameLeaderboard(game, skip, 2);
        seen.push(...page.map((e) => e.user.username));
      }
      expect(seen).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']);
    });

    it('returns nothing past the last page', async () => {
      expect(await service.getGameLeaderboard(game, 50, 10)).toEqual([]);
    });

    it('clamps the page size to the 1..100 range and negative skips to 0', async () => {
      expect(await service.getGameLeaderboard(game, 0, 0)).toHaveLength(1);
      expect(await service.getGameLeaderboard(game, -5, 3)).toHaveLength(3);
      expect(await service.getGameLeaderboard(game, 0, 100_000)).toHaveLength(
        7,
      );
    });
  });

  describe('global leaderboard', () => {
    it('sums each player across games and ranks by the total', async () => {
      const other = await games.save(
        games.create({
          slug: 'other',
          name: 'Other',
          description: 'x',
          type: 'word',
        }),
      );
      await seed(
        'alice',
        { score: 300, wins: 3, sessions: 4 },
        '2026-03-01T00:00:00Z',
      );
      await seed(
        'alice',
        { score: 400, wins: 4, sessions: 5 },
        '2026-03-02T00:00:00Z',
        other,
      );
      await seed(
        'bob',
        { score: 600, wins: 6, sessions: 6 },
        '2026-03-01T00:00:00Z',
      );

      const board = await service.getGlobalLeaderboard();

      expect(
        board.map((r) => [
          Number(r.totalScore),
          Number(r.wins),
          Number(r.totalSessions),
        ]),
      ).toEqual([
        [700, 7, 9],
        [600, 6, 6],
      ]);
    });

    it('breaks equal totals by the most recent activity and paginates', async () => {
      await seed(
        'old',
        { score: 500, wins: 1, sessions: 1 },
        '2026-03-01T00:00:00Z',
      );
      await seed(
        'new',
        { score: 500, wins: 1, sessions: 1 },
        '2026-03-05T00:00:00Z',
      );
      await seed(
        'top',
        { score: 800, wins: 1, sessions: 1 },
        '2026-03-02T00:00:00Z',
      );

      const all = await service.getGlobalLeaderboard();
      expect(all).toHaveLength(3);
      expect(all.map((r) => Number(r.totalScore))).toEqual([800, 500, 500]);

      const first = await service.getGlobalLeaderboard(0, 2);
      const rest = await service.getGlobalLeaderboard(2, 2);
      expect(first).toHaveLength(2);
      expect(rest).toHaveLength(1);
      // The tie is broken by recency, so the newer of the two precedes the older.
      const [newer, older] = [first[1], rest[0]];
      expect(new Date(newer.lastUpdated).getTime()).toBeGreaterThan(
        new Date(older.lastUpdated).getTime(),
      );
    });
  });
});
