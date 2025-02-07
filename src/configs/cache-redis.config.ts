import { CacheModuleOptions, CacheOptionsFactory, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { CACHE_TTL, CACHE_TTL_DEFAULT } from './constants.config';

@Injectable()
export class RedisCacheConfig implements CacheOptionsFactory {
  private readonly logger = new Logger(RedisCacheConfig.name);
  private memoryCache: CacheModuleOptions;
  constructor(private config: ConfigService) {}

  public createCacheOptions(): CacheModuleOptions {
    const env = process.env.NODE_ENV;
    this.logger.debug(`initialized cache for env ${env}`);

    const hasRedisConfig = Boolean(this.config.get('REDIS_STORE_HOST'));
    if (!hasRedisConfig) {
      return {}; // Use default settings in case of no Redis config.
    }
    if (this.config.get('REDIS_CLUSTER') === 'true') {
      this.memoryCache = {
        store: redisStore,
        clusterConfig: {
          nodes: [
            {
              port: this.config.get('REDIS_STORE_PORT'),
              host: this.config.get('REDIS_STORE_HOST'),
            },
          ],
          options: {
            maxRedirections: 20,
          },
        },
      };
    } else {
      this.memoryCache = {
        store: redisStore,
        host: this.config.get('REDIS_STORE_HOST'),
        port: this.config.get('REDIS_STORE_PORT'),
        ttl: this.config.get(CACHE_TTL, CACHE_TTL_DEFAULT),
      };
    }

    return this.memoryCache;
  }
}
