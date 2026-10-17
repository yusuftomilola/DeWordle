// @nestjs/swagger 12 ships ESM only, which this jest config cannot load; the
// entities only need its decorators to exist.
jest.mock('@nestjs/swagger', () => ({
  ApiProperty: () => () => undefined,
  ApiPropertyOptional: () => () => undefined,
}));

// @nestjs/typeorm's token helper fails against the installed typeorm major.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { UnauthorizedException } from '@nestjs/common';
import { FindOperator } from 'typeorm';
import * as crypto from 'crypto';
import {
  MAX_REFRESH_FAMILY_DEPTH,
  RefreshTokenService,
} from './refresh-token.service';

type Row = Record<string, any>;

const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');

/** Minimal in-memory stand-in for the refresh_tokens repository. */
class FakeTokenRepo {
  rows: Row[] = [];
  failNextSave = false;

  create(data: Row): Row {
    return { id: crypto.randomUUID(), usedAt: null, revokedAt: null, ...data };
  }
  async save(row: Row): Promise<Row> {
    if (this.failNextSave) {
      this.failNextSave = false;
      throw new Error('db down');
    }
    this.rows.push(row);
    return row;
  }
  async findOne({ where }: { where: Row }): Promise<Row | null> {
    return (
      this.rows.find((r) =>
        Object.entries(where).every(([k, v]) => r[k] === v),
      ) ?? null
    );
  }
  async update(criteria: Row, patch: Row): Promise<{ affected: number }> {
    const matches = this.rows.filter((r) =>
      Object.entries(criteria).every(([k, v]) =>
        v instanceof FindOperator ? r[k] == null : r[k] === v,
      ),
    );
    matches.forEach((r) => Object.assign(r, patch));
    return { affected: matches.length };
  }
  snapshot() {
    return JSON.parse(JSON.stringify(this.rows));
  }
  restore(rows: Row[]) {
    this.rows = rows.map((r) => ({
      ...r,
      expiresAt: new Date(r.expiresAt),
    }));
  }
}

function build() {
  const repo = new FakeTokenRepo();
  // Transaction rolls back to the snapshot if the callback throws.
  const manager = {
    getRepository: () => repo,
    transaction: async (fn: (m: unknown) => Promise<unknown>) => {
      const before = repo.snapshot();
      try {
        return await fn(manager);
      } catch (e) {
        repo.restore(before);
        throw e;
      }
    },
  };
  (repo as any).manager = manager;
  const sessions = { find: jest.fn().mockResolvedValue([]), save: jest.fn() };
  const audit = { log: jest.fn() };
  const service = new RefreshTokenService(
    repo as any,
    sessions as any,
    audit as any,
  );
  return { repo, service, audit };
}

describe('RefreshTokenService rotation (#1529)', () => {
  it('issues a new token in the same family and marks the old one used', async () => {
    const { service, repo } = build();
    const first = await service.generateRefreshToken('w', 1);
    const second = await service.rotateRefreshToken(first.token, 'w', 1);

    expect(second.token).not.toBe(first.token);
    const [a, b] = repo.rows;
    expect(a.usedAt).toBeInstanceOf(Date);
    expect(b.familyId).toBe(a.familyId);
    expect(b.depth).toBe(1);
    expect(b.usedAt).toBeNull();
    expect(a.tokenHash).toBe(sha(first.token));
  });

  it('reuse of a rotated token revokes every token and writes an audit event', async () => {
    const { service, repo, audit } = build();
    const first = await service.generateRefreshToken('w', 1);
    const second = await service.rotateRefreshToken(first.token, 'w', 1);

    await expect(
      service.rotateRefreshToken(first.token, 'w', 1, 'ua', '1.2.3.4'),
    ).rejects.toThrow(/reuse detected/);

    expect(repo.rows.every((r) => r.revokedAt instanceof Date)).toBe(true);
    expect(audit.log).toHaveBeenCalledWith(
      'AUTH_REFRESH_REPLAY_DETECTED',
      expect.objectContaining({
        walletAddress: 'w',
        ipAddress: '1.2.3.4',
        metadata: expect.objectContaining({ familyId: repo.rows[0].familyId }),
      }),
    );
    // The legitimately rotated token is dead too.
    await expect(
      service.rotateRefreshToken(second.token, 'w', 1),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects unknown, revoked and expired tokens without treating them as replay', async () => {
    const { service, repo, audit } = build();
    await expect(
      service.rotateRefreshToken('nope', 'w', 1),
    ).rejects.toThrow(/revoked or invalid/);

    const t = await service.generateRefreshToken('w', 1);
    await service.revokeRefreshToken(t.token).catch(() => undefined);
    repo.rows[0].revokedAt = new Date();
    await expect(service.rotateRefreshToken(t.token, 'w', 1)).rejects.toThrow(
      /revoked or invalid/,
    );

    const e = await service.generateRefreshToken('w', 1);
    repo.rows[1].expiresAt = new Date(Date.now() - 1000);
    await expect(service.rotateRefreshToken(e.token, 'w', 1)).rejects.toThrow(
      /revoked or invalid/,
    );
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('is atomic: a failure issuing the successor leaves the old token usable', async () => {
    const { service, repo } = build();
    const first = await service.generateRefreshToken('w', 1);
    repo.failNextSave = true;
    await expect(service.rotateRefreshToken(first.token, 'w', 1)).rejects.toThrow(
      'db down',
    );
    expect(repo.rows).toHaveLength(1);
    expect(repo.rows[0].usedAt).toBeNull();
    await expect(
      service.rotateRefreshToken(first.token, 'w', 1),
    ).resolves.toBeDefined();
  });

  it('concurrent use of one token yields exactly one successor', async () => {
    const { service, repo } = build();
    const first = await service.generateRefreshToken('w', 1);
    const results = await Promise.allSettled([
      service.rotateRefreshToken(first.token, 'w', 1),
      service.rotateRefreshToken(first.token, 'w', 1),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    // Replay detection then revoked everything, including the successor.
    expect(repo.rows.every((r) => r.revokedAt)).toBe(true);
  });

  it('caps family depth at 100 and revokes the family', async () => {
    const { service, repo } = build();
    let token = (await service.generateRefreshToken('w', 1)).token;
    for (let i = 0; i < MAX_REFRESH_FAMILY_DEPTH; i++) {
      token = (await service.rotateRefreshToken(token, 'w', 1)).token;
    }
    expect(repo.rows[repo.rows.length - 1].depth).toBe(
      MAX_REFRESH_FAMILY_DEPTH,
    );
    await expect(service.rotateRefreshToken(token, 'w', 1)).rejects.toThrow(
      /depth exceeded/,
    );
    expect(repo.rows.every((r) => r.revokedAt)).toBe(true);
  });
});
