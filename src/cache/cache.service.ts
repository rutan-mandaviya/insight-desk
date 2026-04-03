import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await this.redisClient.set(key, stringValue, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = this.redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          stream.pause();
          await this.redisClient.del(...keys);
          stream.resume();
        }
      });

      stream.on('end', () => {
        this.logger.log(`Deleted cache keys matching pattern: ${pattern}`);
        resolve();
      });

      stream.on('error', (err) => {
        this.logger.error(`Error scanning cache pattern ${pattern}:`, err);
        reject(err);
      });
    });
  }
}
