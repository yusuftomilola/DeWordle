import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthSession } from './entities/auth-session.entity';
import { AuditService } from '../common/audit/audit.service';

const MAX_SESSIONS_PER_WALLET = 3;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
/** Maximum number of rotations allowed within one token family. */
export const MAX_REFRESH_FAMILY_DEPTH = 100;

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(AuthSession)
    private readonly authSessionRepo: Repository<AuthSession>,
    private readonly auditService: AuditService,
  ) {}

  async generateRefreshToken(
    walletAddress: string,
    userId: number,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const issued = await this.issueToken(this.refreshTokenRepo, {
      walletAddress,
      userId,
      userAgent,
      ipAddress,
      familyId: crypto.randomUUID(),
      depth: 0,
    });

    await this.enforceConcurrentSessionLimit(walletAddress);

    return issued;
  }

  private async issueToken(
    repo: Repository<RefreshToken>,
    params: {
      walletAddress: string;
      userId: number;
      userAgent?: string;
      ipAddress?: string;
      familyId: string;
      depth: number;
    },
  ): Promise<{ token: string; expiresAt: Date }> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await repo.save(
      repo.create({
        tokenHash,
        walletAddress: params.walletAddress,
        expiresAt,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        familyId: params.familyId,
        depth: params.depth,
        user: { id: params.userId } as any,
      }),
    );

    return { token: rawToken, expiresAt };
  }

  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const refreshToken = await this.refreshTokenRepo.findOne({
      where: {
        tokenHash,
        expiresAt: MoreThan(new Date()),
        revokedAt: null,
      },
      relations: { user: true },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return refreshToken;
  }

  /**
   * Exchanges a refresh token for a new one in a single transaction: the old
   * token is marked used and its successor (same family, depth + 1) is issued
   * together or not at all. Presenting an already-used token is treated as a
   * replay and revokes every token for the wallet.
   */
  async rotateRefreshToken(
    oldToken: string,
    walletAddress: string,
    userId: number,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(oldToken)
      .digest('hex');

    const outcome = await this.refreshTokenRepo.manager.transaction(
      async (manager) => {
        const repo = manager.getRepository(RefreshToken);
        const existing = await repo.findOne({ where: { tokenHash } });

        if (!existing) return { kind: 'invalid' as const };
        if (existing.usedAt) return { kind: 'replay' as const, existing };
        if (existing.revokedAt || existing.expiresAt <= new Date()) {
          return { kind: 'invalid' as const };
        }
        if (existing.depth >= MAX_REFRESH_FAMILY_DEPTH) {
          await repo.update(
            { familyId: existing.familyId, revokedAt: IsNull() },
            { revokedAt: new Date() },
          );
          return { kind: 'depth' as const };
        }

        // Atomic claim: only one concurrent request can flip usedAt.
        const claim = await repo.update(
          { id: existing.id, usedAt: IsNull(), revokedAt: IsNull() },
          { usedAt: new Date() },
        );
        if (!claim.affected) return { kind: 'replay' as const, existing };

        const issued = await this.issueToken(repo, {
          walletAddress,
          userId,
          userAgent,
          ipAddress,
          familyId: existing.familyId,
          depth: existing.depth + 1,
        });
        return { kind: 'ok' as const, issued };
      },
    );

    if (outcome.kind === 'ok') {
      await this.enforceConcurrentSessionLimit(walletAddress);
      return outcome.issued;
    }

    if (outcome.kind === 'replay') {
      // Outside the transaction so the revocation is not rolled back.
      await this.revokeAllRefreshTokens(outcome.existing.walletAddress);
      this.auditService.log('AUTH_REFRESH_REPLAY_DETECTED', {
        walletAddress: outcome.existing.walletAddress,
        ipAddress,
        userAgent,
        metadata: {
          userId,
          familyId: outcome.existing.familyId,
          tokenId: outcome.existing.id,
          depth: outcome.existing.depth,
        },
      });
      throw new UnauthorizedException(
        'Refresh token reuse detected; all sessions revoked',
      );
    }

    if (outcome.kind === 'depth') {
      throw new UnauthorizedException(
        'Refresh token family depth exceeded; please sign in again',
      );
    }

    throw new UnauthorizedException('Token already revoked or invalid');
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.refreshTokenRepo.update(
      { tokenHash },
      { revokedAt: new Date() },
    );
  }

  async revokeAllRefreshTokens(walletAddress: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { walletAddress, revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  async getActiveSessions(walletAddress: string): Promise<AuthSession[]> {
    return this.authSessionRepo.find({
      where: { walletAddress, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createSession(
    walletAddress: string,
    userId: number,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthSession> {
    const session = this.authSessionRepo.create({
      walletAddress,
      userAgent,
      ipAddress,
      user: { id: userId } as any,
    });
    return this.authSessionRepo.save(session);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.authSessionRepo.update(sessionId, { isActive: false });
  }

  private async enforceConcurrentSessionLimit(
    walletAddress: string,
  ): Promise<void> {
    const activeSessions = await this.authSessionRepo.find({
      where: { walletAddress, isActive: true },
      order: { createdAt: 'ASC' },
    });

    if (activeSessions.length >= MAX_SESSIONS_PER_WALLET) {
      const sessionsToRevoke = activeSessions.slice(
        0,
        activeSessions.length - MAX_SESSIONS_PER_WALLET + 1,
      );

      for (const session of sessionsToRevoke) {
        session.isActive = false;
        await this.authSessionRepo.save(session);
      }
    }
  }
}
