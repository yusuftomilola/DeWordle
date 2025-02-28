import { Injectable, Logger } from "@nestjs/common"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject } from "@nestjs/common"
import type { Cache } from "cache-manager"
import type { GetLeaderboardDto } from "../dto/get-leaderboard.dto"
import type { LeaderboardResponseDto } from "../dto/leaderboard-response.dto"

@Injectable()
export class ContributionCacheService {
  private readonly logger = new Logger(ContributionCacheService.name)
  private readonly LEADERBOARD_CACHE_PREFIX = "contribution_leaderboard:"
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  generateLeaderboardCacheKey(dto: GetLeaderboardDto): string {
    return `${this.LEADERBOARD_CACHE_PREFIX}${dto.timeRange}:${dto.contributionType || "all"}:${dto.pagination.page}:${dto.pagination.limit}`
  }

  async getLeaderboardFromCache(cacheKey: string): Promise<LeaderboardResponseDto | null> {
    try {
      const cachedData = await this.cacheManager.get<LeaderboardResponseDto>(cacheKey)

      if (cachedData) {
        this.logger.log(`Cache hit for key: ${cacheKey}`)
        return cachedData
      }

      this.logger.log(`Cache miss for key: ${cacheKey}`)
      return null
    } catch (error) {
      this.logger.error(`Error getting data from cache: ${error.message}`, error.stack)
      return null
    }
  }

  async cacheLeaderboardData(cacheKey: string, data: LeaderboardResponseDto): Promise<void> {
    try {
      await this.cacheManager.set(cacheKey, data, this.CACHE_TTL)
      this.logger.log(`Cached data with key: ${cacheKey}`)
    } catch (error) {
      this.logger.error(`Error caching data: ${error.message}`, error.stack)
    }
  }

  async invalidateLeaderboardCache(): Promise<void> {
    try {
      // In a real implementation, you would need to use a cache that supports pattern deletion
      // For simplicity, we're just logging that we would invalidate the cache
      this.logger.log("Invalidating leaderboard cache")

      // Example implementation if using Redis:
      // const keys = await this.redisClient.keys(`${this.LEADERBOARD_CACHE_PREFIX}*`);
      // if (keys.length > 0) {
      //   await this.redisClient.del(...keys);
      // }
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error.message}`, error.stack)
    }
  }
}

