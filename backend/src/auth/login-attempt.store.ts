import Redis from 'ioredis';

export const LOGIN_ATTEMPT_STORE = 'LOGIN_ATTEMPT_STORE';

/** Small key/value surface needed for lockout bookkeeping. */
export interface LoginAttemptStore {
  /** Increments a counter, applying `ttlSeconds` when the key is created. */
  incr(key: string, ttlSeconds: number): Promise<number>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(...keys: string[]): Promise<void>;
  /** Remaining time to live in seconds, or null if the key does not exist. */
  ttl(key: string): Promise<number | null>;
}

export class MemoryLoginAttemptStore implements LoginAttemptStore {
  private readonly data = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  private live(key: string) {
    const entry = this.data.get(key);
    if (entry && entry.expiresAt <= this.now()) {
      this.data.delete(key);
      return undefined;
    }
    return entry;
  }

  async incr(key: string, ttlSeconds: number): Promise<number> {
    const entry = this.live(key);
    if (!entry) {
      this.data.set(key, {
        value: '1',
        expiresAt: this.now() + ttlSeconds * 1000,
      });
      return 1;
    }
    entry.value = String(Number(entry.value) + 1);
    return Number(entry.value);
  }

  async get(key: string): Promise<string | null> {
    return this.live(key)?.value ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.data.set(key, { value, expiresAt: this.now() + ttlSeconds * 1000 });
  }

  async del(...keys: string[]): Promise<void> {
    keys.forEach((k) => this.data.delete(k));
  }

  async ttl(key: string): Promise<number | null> {
    const entry = this.live(key);
    return entry ? Math.ceil((entry.expiresAt - this.now()) / 1000) : null;
  }
}

export class RedisLoginAttemptStore implements LoginAttemptStore {
  constructor(private readonly redis: Redis) {}

  async incr(key: string, ttlSeconds: number): Promise<number> {
    const value = await this.redis.incr(key);
    if (value === 1) await this.redis.expire(key, ttlSeconds);
    return value;
  }

  get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.redis.del(...keys);
  }

  async ttl(key: string): Promise<number | null> {
    const seconds = await this.redis.ttl(key);
    return seconds >= 0 ? seconds : null;
  }
}

export function createLoginAttemptStore(
  redisUrl: string | undefined,
): LoginAttemptStore {
  if (!redisUrl) return new MemoryLoginAttemptStore();
  return new RedisLoginAttemptStore(new Redis(redisUrl));
}
