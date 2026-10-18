// The two Nest integrations below are stubbed because of known ESM/version
// problems in this repo's jest setup (see other specs); only decorators needed.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
jest.mock('@nestjs/swagger', () => ({
  ApiProperty: () => () => undefined,
  ApiPropertyOptional: () => () => undefined,
}));

import { BadRequestException } from '@nestjs/common';
import {
  buildDigestStats,
  computeStreak,
  describeRankChange,
  rankFor,
  weekStartOf,
} from './digest-stats';
import {
  DEFAULT_DIGEST_HTML,
  renderDigestTemplate,
  validateDigestTemplate,
} from './digest-template';
import { DigestService } from './digest.service';

describe('digest stats (#1545)', () => {
  it('computes the Monday week start in UTC', () => {
    expect(weekStartOf(new Date('2026-10-19T09:00:00Z'))).toBe('2026-10-19'); // Mon
    expect(weekStartOf(new Date('2026-10-25T23:59:00Z'))).toBe('2026-10-19'); // Sun
    expect(weekStartOf(new Date('2026-10-26T00:00:00Z'))).toBe('2026-10-26'); // Mon
  });

  it('ranks by wins with ties sharing a rank', () => {
    expect(rankFor(5, [5, 5, 3, 9])).toBe(2);
    expect(rankFor(9, [5, 5, 3, 9])).toBe(1);
  });

  it('counts consecutive days back from today or yesterday', () => {
    expect(computeStreak(['2026-10-18', '2026-10-17', '2026-10-15'], '2026-10-18')).toBe(2);
    // not played today yet: streak still counts through yesterday
    expect(computeStreak(['2026-10-17', '2026-10-16'], '2026-10-18')).toBe(2);
    expect(computeStreak(['2026-10-10'], '2026-10-18')).toBe(0);
    expect(computeStreak([], '2026-10-18')).toBe(0);
  });

  it('derives rank change from wins before vs. at the end of the week', () => {
    const me = { userId: 1, winsTotal: 6, winsBeforeWeek: 2, playedWeek: 5, winsWeek: 4 };
    const rival = { userId: 2, winsTotal: 5, winsBeforeWeek: 4, playedWeek: 2, winsWeek: 1 };
    const stats = buildDigestStats(me, [me, rival], ['2026-10-18'], '2026-10-18');
    expect(stats).toEqual({
      gamesPlayed: 5,
      winRate: 80,
      streak: 1,
      rank: 1,
      rankChange: 1, // was 2nd, now 1st
    });
    expect(describeRankChange(1)).toBe('up 1');
    expect(describeRankChange(-2)).toBe('down 2');
    expect(describeRankChange(0)).toBe('no change');
  });

  it('win rate is 0 when no games were played', () => {
    const idle = { userId: 1, winsTotal: 0, winsBeforeWeek: 0, playedWeek: 0, winsWeek: 0 };
    expect(buildDigestStats(idle, [idle], [], '2026-10-18').winRate).toBe(0);
  });
});

describe('digest template (#1545)', () => {
  it('fills placeholders and HTML-escapes values', () => {
    const out = renderDigestTemplate('Hi {{name}} / {{ gamesPlayed }} / {{unknown}}', {
      name: '<b>Eve</b>',
      gamesPlayed: '3',
      winRate: '',
      streak: '',
      rank: '',
      rankChange: '',
    });
    expect(out).toBe('Hi &lt;b&gt;Eve&lt;/b&gt; / 3 / {{unknown}}');
  });

  it('default template uses inline styles only and only known placeholders', () => {
    expect(DEFAULT_DIGEST_HTML).not.toMatch(/<style/i);
    expect(DEFAULT_DIGEST_HTML).toContain('style="');
    expect(validateDigestTemplate('Subject', DEFAULT_DIGEST_HTML)).toBeNull();
  });

  it('rejects scripts, event handlers and unknown placeholders', () => {
    expect(validateDigestTemplate('s', '<script>x</script>')).toMatch(/scripts/);
    expect(validateDigestTemplate('s', '<a onclick="x()">y</a>')).toMatch(/scripts/);
    expect(validateDigestTemplate('s', '{{password}}')).toMatch(/password/);
  });
});

describe('DigestService (#1545)', () => {
  const NOW = new Date('2026-10-19T09:00:00Z'); // Monday 09:00 UTC

  function build(opts: { sendResult?: boolean; delivered?: Record<number, string> } = {}) {
    const alice = { id: 1, email: 'alice@x.io', username: 'alice', digestOptIn: true };
    const bob = { id: 2, email: 'bob@x.io', username: 'bob', digestOptIn: true };
    const sessions = {
      query: jest
        .fn()
        // week rows
        .mockResolvedValueOnce([
          { userId: 1, winsTotal: '6', winsBeforeWeek: '2', playedWeek: '5', winsWeek: '4', recent: '5' },
          { userId: 2, winsTotal: '3', winsBeforeWeek: '3', playedWeek: '0', winsWeek: '0', recent: '0' },
        ])
        // played days
        .mockResolvedValueOnce([{ userId: 1, day: '2026-10-18' }]),
    };
    const users = { find: jest.fn().mockResolvedValue([alice, bob]) };
    const templates = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn() };
    const saved: any[] = [];
    const deliveries = {
      findOne: jest.fn(async ({ where }: any) =>
        opts.delivered?.[where.userId]
          ? { status: opts.delivered[where.userId] }
          : null,
      ),
      upsert: jest.fn(async (row: any) => void saved.push(row)),
    };
    const email = { sendMail: jest.fn().mockResolvedValue(opts.sendResult ?? true) };
    const service = new DigestService(
      users as any,
      sessions as any,
      templates as any,
      deliveries as any,
      email as any,
    );
    return { service, email, deliveries, saved, templates, sessions };
  }

  it('emails only active, opted-in players and logs each delivery', async () => {
    const { service, email, saved } = build();
    const summary = await service.sendWeeklyDigest(NOW);

    expect(summary).toEqual({ weekStart: '2026-10-19', eligible: 1, sent: 1, failed: 0, skipped: 0 });
    expect(email.sendMail).toHaveBeenCalledTimes(1);
    const [to, subject, html] = email.sendMail.mock.calls[0];
    expect(to).toBe('alice@x.io');
    expect(subject).toBe('Your DeWordle week in review');
    expect(html).toContain('alice');
    expect(html).toContain('80%'); // 4 of 5
    expect(html).toContain('#1');
    expect(html).toContain('up 1');
    expect(saved).toEqual([
      { userId: 1, weekStart: '2026-10-19', status: 'sent', error: null },
    ]);
  });

  it('the query window ends at Monday 00:00 UTC and spans 7 days', async () => {
    const { service, sessions } = build();
    await service.sendWeeklyDigest(NOW);
    const [start, end] = sessions.query.mock.calls[0][1];
    expect(end.toISOString()).toBe('2026-10-19T00:00:00.000Z');
    expect(start.toISOString()).toBe('2026-10-12T00:00:00.000Z');
  });

  it('records a failed delivery when the transport rejects the message', async () => {
    const { service, saved } = build({ sendResult: false });
    const summary = await service.sendWeeklyDigest(NOW);
    expect(summary).toMatchObject({ sent: 0, failed: 1 });
    expect(saved[0]).toMatchObject({ userId: 1, status: 'failed' });
  });

  it('does not send twice for the same week but retries earlier failures', async () => {
    const sent = build({ delivered: { 1: 'sent' } });
    expect(await sent.service.sendWeeklyDigest(NOW)).toMatchObject({ skipped: 1, sent: 0 });
    expect(sent.email.sendMail).not.toHaveBeenCalled();

    const failedBefore = build({ delivered: { 1: 'failed' } });
    expect(await failedBefore.service.sendWeeklyDigest(NOW)).toMatchObject({ sent: 1 });
  });

  it('stores an admin template after validation and rejects unsafe ones', async () => {
    const { service, templates } = build();
    await service.updateTemplate('Hi {{name}}', '<p>{{gamesPlayed}}</p>', 'root@x.io');
    expect(templates.save).toHaveBeenCalledWith({
      id: 1,
      subject: 'Hi {{name}}',
      bodyHtml: '<p>{{gamesPlayed}}</p>',
      updatedBy: 'root@x.io',
    });
    await expect(service.updateTemplate('s', '<script>1</script>', 'a')).rejects.toThrow(
      BadRequestException,
    );
  });
});
