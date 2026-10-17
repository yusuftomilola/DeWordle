import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuditService } from '../common/audit/audit.service';
import {
  LOGIN_ATTEMPT_STORE,
  type LoginAttemptStore,
} from './login-attempt.store';

export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_RATE_WINDOW_SECONDS = 60;
export const LOCKOUT_FAILURE_THRESHOLD = 10;
export const LOCKOUT_BASE_MINUTES = 30;
/** Doubling stops here so a lock can never grow without bound. */
export const LOCKOUT_MAX_MINUTES = 24 * 60;

const FAILURE_TTL_SECONDS = 24 * 60 * 60;
const LOCKOUT_HISTORY_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface AttemptContext {
  ipAddress?: string;
  userAgent?: string;
}

const norm = (email: string) => email.toLowerCase().trim();

@Injectable()
export class AccountLockoutService {
  constructor(
    @Inject(LOGIN_ATTEMPT_STORE) private readonly store: LoginAttemptStore,
    private readonly audit: AuditService,
  ) {}

  private key(kind: string, email: string) {
    return `auth:${kind}:${norm(email)}`;
  }

  /** Throws 423 while locked and 429 once the per-minute budget is spent. */
  async assertCanAttempt(email: string): Promise<void> {
    const lockKey = this.key('lock', email);
    if ((await this.store.get(lockKey)) !== null) {
      const retryAfter = (await this.store.ttl(lockKey)) ?? 0;
      throw new HttpException(
        {
          statusCode: HttpStatus.LOCKED,
          message: 'Account temporarily locked due to repeated failed logins',
          retryAfterSeconds: retryAfter,
        },
        HttpStatus.LOCKED,
      );
    }

    const attempts = await this.store.incr(
      this.key('rate', email),
      LOGIN_RATE_WINDOW_SECONDS,
    );
    if (attempts > LOGIN_RATE_LIMIT) {
      const retryAfter =
        (await this.store.ttl(this.key('rate', email))) ??
        LOGIN_RATE_WINDOW_SECONDS;
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many login attempts, try again later',
          retryAfterSeconds: retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Counts a failed login; locks the account on the 10th consecutive one. */
  async recordFailure(email: string, ctx: AttemptContext = {}): Promise<void> {
    const failures = await this.store.incr(
      this.key('fail', email),
      FAILURE_TTL_SECONDS,
    );
    if (failures < LOCKOUT_FAILURE_THRESHOLD) return;

    const lockouts = await this.store.incr(
      this.key('lockouts', email),
      LOCKOUT_HISTORY_TTL_SECONDS,
    );
    const minutes = Math.min(
      LOCKOUT_BASE_MINUTES * 2 ** (lockouts - 1),
      LOCKOUT_MAX_MINUTES,
    );
    await this.store.set(
      this.key('lock', email),
      String(Date.now() + minutes * 60_000),
      minutes * 60,
    );
    await this.store.del(this.key('fail', email));

    this.audit.log('AUTH_ACCOUNT_LOCKED', {
      walletAddress: norm(email),
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { email: norm(email), lockoutCount: lockouts, minutes },
    });
  }

  /** A successful login clears the failure streak (lockout history is kept). */
  async recordSuccess(email: string): Promise<void> {
    await this.store.del(this.key('fail', email), this.key('rate', email));
  }

  async isLocked(email: string): Promise<boolean> {
    return (await this.store.get(this.key('lock', email))) !== null;
  }

  /** Admin override: clears the lock, the failure streak and escalation history. */
  async unlock(email: string, adminEmail: string): Promise<boolean> {
    const wasLocked = await this.isLocked(email);
    await this.store.del(
      this.key('lock', email),
      this.key('fail', email),
      this.key('lockouts', email),
      this.key('rate', email),
    );
    this.audit.log('AUTH_ACCOUNT_UNLOCKED', {
      walletAddress: norm(email),
      metadata: { email: norm(email), unlockedBy: adminEmail, wasLocked },
    });
    return wasLocked;
  }
}
