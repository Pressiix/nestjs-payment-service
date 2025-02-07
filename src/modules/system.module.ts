import { DynamicModule, Module } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import { SystemManagementController } from '../controllers/system.controller';
import { CacheManagerModule } from './cache-manager.module';
@Module({
  controllers: [SystemManagementController],
  providers: [CacheManagerModule],
})
export class SystemManagementModule {
  static register(dbConfig: DataSourceOptions): DynamicModule {
    return {
      module: SystemManagementModule,
      providers: [
        {
          provide: 'DB_CONFIG_OPTIONS',
          useValue: dbConfig,
        },
      ],
    };
  }
}
