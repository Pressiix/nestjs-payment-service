import { Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataSource, DataSourceOptions } from 'typeorm';
import { CacheManagerService } from '../services/cache-manager.service';
@Controller('/payment/admin')
@UseGuards(AuthGuard('x-api-key'))
export class SystemManagementController {
  constructor(
    @Inject('DB_CONFIG_OPTIONS')
    private dbConfig: DataSourceOptions,
    private readonly cacheService: CacheManagerService,
  ) {}

  async getOrm(): Promise<DataSource> {
    const orm = new DataSource(this.dbConfig);
    return orm.initialize();
  }

  @Post('/migrate-up')
  async migrateUp() {
    const orm = await this.getOrm();
    if (!orm.isInitialized) {
      this.__errorHandle();
    }
    const res = await orm.runMigrations();
    await orm.destroy();
    return {
      message: `success ${res.length} records has been migrated up`,
      records: res.map((o) => ({ file: o.name })),
    };
  }

  @Post('/migrate-down')
  async migrateDown() {
    const orm = await this.getOrm();
    if (!orm.isInitialized) {
      this.__errorHandle();
    }
    await orm.undoLastMigration();
    await orm.destroy();
    return {
      message: 'success migrated down',
    };
  }

  @Get('/clear-cache/:key')
  async clearRedisCache(@Param('key') key: string) {
    await this.cacheService.removeData(key);
    return {
      message: 'removed success',
    };
  }

  private __errorHandle() {
    throw new Error('orm not initialized');
  }
}
