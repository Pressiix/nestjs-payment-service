import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { RedisCacheConfig } from '../configs/cache-redis.config';
import { CacheManagerService } from '../services/cache-manager.service';
@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: RedisCacheConfig,
    }),
  ],
  providers: [CacheManagerService],
  controllers: [],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}
