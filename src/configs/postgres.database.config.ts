import { join } from 'path';

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const postgresDbConfig = (): PostgresConnectionOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || '54323'),
  username: process.env.DB_USERNAME || 'payment_user',
  password: process.env.DB_PASS || 'payment_pass',
  database: process.env.DB_NAME || 'bondbond',
  schema: process.env.DB_SCHEMA || 'payment',
  logging: false,
  entities: [join(__dirname, '../entities/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/postgres/*{.ts,.js}')],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
});

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
  Logger.debug(postgresDbConfig());
}

export default new DataSource(postgresDbConfig());
