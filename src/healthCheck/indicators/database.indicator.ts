import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { AllowConnectionOptions } from '../../modules/healthCheck.module';

@Injectable()
export class DatabaseIndicator extends HealthIndicator {
  constructor(
    @Inject('DB_CONFIG_OPTIONS')
    private dbConfig: AllowConnectionOptions,
  ) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const db = new DataSource(this.dbConfig);
    const orm = await db.initialize();
    const isHealthy = orm.isInitialized;
    await orm.destroy();
    return this.getStatus(this.dbConfig.type, isHealthy, {
      database: this.dbConfig.database,
      schema: this.dbConfig.schema,
    });
  }
}
