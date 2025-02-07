import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { CacheManagerService } from '../../services/cache-manager.service';

@Injectable()
export class RedisIndicator extends HealthIndicator {
  constructor(private readonly redisCacheService: CacheManagerService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const key = 'redis';
    try {
      const isHealthy = this.redisCacheService.isHealthy();
      return this.getStatus(key, isHealthy);
    } catch (err) {
      throw new HealthCheckError('Redis service', this.getStatus(key, false));
    }
  }
}
