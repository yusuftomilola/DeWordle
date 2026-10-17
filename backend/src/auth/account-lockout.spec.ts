// @nestjs/typeorm's token helper fails against the installed typeorm major
// (pulled in transitively through the audit service import).
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpException } from '@nestjs/common';
import {
  AccountLockoutService,
  LOCKOUT_FAILURE_THRESHOLD,
  LOGIN_RATE_LIMIT,
} from './account-lockout.service';
import { MemoryLoginAttemptStore } from './login-attempt.store';

function setup() {
  let now = 1_000_000;
  const store = new MemoryLoginAttemptStore(() => now);
  const audit = { log: jest.fn() };
  const service = new AccountLockoutService(store, audit as any);
  return {
    service,
    audit,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

const status = async (p: Promise<unknown>) => {
  try {
    await p;
    return 200;
  } catch (e) {
    return (e as HttpException).getStatus();
  }
};

/** Fail `n` times, spacing attempts so the per-minute limit never trips. */
async function fail(
  ctx: ReturnType<typeof setup>,
  email: string,
  n: number,
) {
  for (let i = 0; i < n; i++) {
    await ctx.service.assertCanAttempt(email);
    await ctx.service.recordFailure(email);
    ctx.advance(61_000);
  }
}

describe('AccountLockoutService (#1532)', () => {
  it('allows 5 attempts per minute per email, then answers 429', async () => {
    const ctx = setup();
    for (let i = 0; i < LOGIN_RATE_LIMIT; i++) {
      await ctx.service.assertCanAttempt('a@x.io');
    }
    expect(await status(ctx.service.assertCanAttempt('a@x.io'))).toBe(429);
    // Other emails are unaffected, and the window resets after a minute.
    expect(await status(ctx.service.assertCanAttempt('b@x.io'))).toBe(200);
    ctx.advance(60_001);
    expect(await status(ctx.service.assertCanAttempt('a@x.io'))).toBe(200);
  });

  it('is case/whitespace-insensitive on the email key', async () => {
    const ctx = setup();
    for (let i = 0; i < LOGIN_RATE_LIMIT; i++) {
      await ctx.service.assertCanAttempt('A@X.io ');
    }
    expect(await status(ctx.service.assertCanAttempt('a@x.io'))).toBe(429);
  });

  it('locks for 30 minutes after 10 consecutive failures and audits it', async () => {
    const ctx = setup();
    await fail(ctx, 'a@x.io', LOCKOUT_FAILURE_THRESHOLD - 1);
    expect(await ctx.service.isLocked('a@x.io')).toBe(false);
    await fail(ctx, 'a@x.io', 1);
    expect(await ctx.service.isLocked('a@x.io')).toBe(true);
    expect(await status(ctx.service.assertCanAttempt('a@x.io'))).toBe(423);
    expect(ctx.audit.log).toHaveBeenCalledWith(
      'AUTH_ACCOUNT_LOCKED',
      expect.objectContaining({
        metadata: expect.objectContaining({ minutes: 30, lockoutCount: 1 }),
      }),
    );
    // Lock was set 61s before "now"; still locked just before 30 minutes.
    ctx.advance(29 * 60_000 - 61_000);
    expect(await ctx.service.isLocked('a@x.io')).toBe(true);
    ctx.advance(2 * 60_000);
    expect(await ctx.service.isLocked('a@x.io')).toBe(false);
  });

  it('doubles the lock duration for each subsequent lockout: 30, 60, 120', async () => {
    const ctx = setup();
    const minutes: number[] = [];
    for (let round = 0; round < 3; round++) {
      await fail(ctx, 'a@x.io', LOCKOUT_FAILURE_THRESHOLD);
      minutes.push(
        ctx.audit.log.mock.calls[ctx.audit.log.mock.calls.length - 1][1]
          .metadata.minutes,
      );
      ctx.advance(24 * 60 * 60_000 - 1); // wait out the lock, stay within history window
    }
    expect(minutes).toEqual([30, 60, 120]);
  });

  it('a successful login resets the consecutive-failure streak', async () => {
    const ctx = setup();
    await fail(ctx, 'a@x.io', LOCKOUT_FAILURE_THRESHOLD - 1);
    await ctx.service.recordSuccess('a@x.io');
    await fail(ctx, 'a@x.io', LOCKOUT_FAILURE_THRESHOLD - 1);
    expect(await ctx.service.isLocked('a@x.io')).toBe(false);
  });

  it('admin unlock clears the lock and escalation, and is audited', async () => {
    const ctx = setup();
    await fail(ctx, 'a@x.io', LOCKOUT_FAILURE_THRESHOLD);
    expect(await ctx.service.isLocked('a@x.io')).toBe(true);

    expect(await ctx.service.unlock('a@x.io', 'root@x.io')).toBe(true);
    expect(await ctx.service.isLocked('a@x.io')).toBe(false);
    expect(ctx.audit.log).toHaveBeenLastCalledWith(
      'AUTH_ACCOUNT_UNLOCKED',
      expect.objectContaining({
        metadata: expect.objectContaining({
          unlockedBy: 'root@x.io',
          wasLocked: true,
        }),
      }),
    );

    // Escalation history was cleared, so the next lock is 30 minutes again.
    await fail(ctx, 'a@x.io', LOCKOUT_FAILURE_THRESHOLD);
    const last =
      ctx.audit.log.mock.calls[ctx.audit.log.mock.calls.length - 1][1];
    expect(last.metadata.minutes).toBe(30);
  });
});
