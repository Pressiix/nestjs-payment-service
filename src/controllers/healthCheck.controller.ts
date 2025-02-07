import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseIndicator } from '../healthCheck/indicators/database.indicator';
import { RedisIndicator } from '../healthCheck/indicators/redis.indicator';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private db: DatabaseIndicator, private redis: RedisIndicator) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([() => this.db.isHealthy(), () => this.redis.isHealthy()]);
  }
}
