import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { OracleConnectionOptions } from 'typeorm/driver/oracle/OracleConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { HealthController } from '../controllers/healthCheck.controller';
import { DatabaseIndicator } from '../healthCheck/indicators/database.indicator';
import { RedisIndicator } from '../healthCheck/indicators/redis.indicator';
export type AllowConnectionOptions = PostgresConnectionOptions | OracleConnectionOptions;

@Module({
  imports: [TerminusModule],
  providers: [DatabaseIndicator, RedisIndicator],
  controllers: [HealthController],
})
export class HealthCheckModule {
  static register(dbConfig: AllowConnectionOptions): DynamicModule {
    return {
      module: HealthCheckModule,
      providers: [
        {
          provide: 'DB_CONFIG_OPTIONS',
          useValue: dbConfig,
        },
      ],
    };
  }
}
