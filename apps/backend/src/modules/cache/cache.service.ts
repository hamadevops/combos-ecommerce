// cache/cache.service.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  private redisClient: Redis;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB_NUMBER_CACHE');

    this.redisClient = new Redis({
      host,
      port,
      password,
      db,
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const data = await this.cacheManager.get<T>(key);
    return data;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl && typeof ttl === 'number') {
      await this.cacheManager.set(key, value, ttl);
    } else {
      await this.cacheManager.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  async getKeys(pattern: string = '*'): Promise<string[]> {
    try {
      if (pattern && pattern.trim() !== '') {
        let searchPattern = pattern;
        if (!searchPattern.startsWith('*')) searchPattern = `*${searchPattern}`;
        if (!searchPattern.endsWith('*')) searchPattern = `${searchPattern}*`;
        return await this.redisClient.keys(searchPattern);
      }
      return await this.redisClient.keys('*');
    } catch (error) {
      console.error('Error getting keys from Redis:', error);
      return [];
    }
  }

  async getRaw(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async deleteRaw(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.getKeys(pattern);
      if (keys.length > 0) {
        // Use pipeline for efficient deletion
        const pipeline = this.redisClient.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
        console.log(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`Error clearing keys with pattern ${pattern}:`, error);
    }
  }
}
