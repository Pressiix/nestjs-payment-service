import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_KEY_ALL, CACHE_TTL, CACHE_TTL_DEFAULT } from '../configs/constants.config';
import { ConfigServiceType } from './config.service';

// Public Types
export type Cacher<T> = () => Promise<T>;
export type TTLResolver<T> = (v: T) => number | undefined;
export interface OnceOptions<T> {
  /**
   * ttl in seconds to save the the cache result.
   */
  ttl: TTLResolver<T>;
  /**
   * If true, neglect the cache query, and fetch with resolver.
   * Once done update the cache.
   * If false (default) use cache, if cache misses, use resolver
   * Once done update the cache.
   */
  ignoreCache: boolean;
}

// Private Types
type OnceOptionFormat<T> = number | TTLResolver<T> | Partial<OnceOptions<T>>;

/**
 * Utility function to resolve nested arguments into the `OnceOptions` interface.
 * @param ttlOrOptions
 * @returns transformed to simpler form
 */
function toOnceOptions<T>(ttlOrOptions: OnceOptionFormat<T> = {}): OnceOptions<T> {
  if (typeof ttlOrOptions === 'number') {
    return {
      ttl: () => ttlOrOptions,
      ignoreCache: false,
    };
  }
  if (typeof ttlOrOptions === 'function') {
    return {
      ttl: ttlOrOptions,
      ignoreCache: false,
    };
  }
  return {
    ttl: () => undefined,
    ignoreCache: false,
    ...ttlOrOptions,
  };
}

@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name);

  constructor(@Inject(CACHE_MANAGER) private memoryCache: Cache, @Inject('CONFIG') private config: ConfigServiceType) {}

  public isHealthy() {
    const redisClient = (this.memoryCache.store as any).getClient();
    return redisClient?.connector?.stream?._readableState?.reading;
  }

  public async getData(key: string): Promise<any> {
    const data = await this.memoryCache.get(key);
    return data;
  }

  public async setData(key: string, data: any, ttl?: number) {
    const defaultTime: number = this.config.get(CACHE_TTL, CACHE_TTL_DEFAULT);
    return this.memoryCache.set(key, data, { ttl: ttl || defaultTime });
  }

  public async removeData(key: string) {
    if (key === CACHE_KEY_ALL) {
      await this.memoryCache.reset();
    } else {
      await this.memoryCache.del(key);
    }
    return key;
  }

  /**
   * Cache the result of cacher if cache is missed from the caching source
   *
   * @param key - key to lookup for the cache
   * @param cacher - callback to resolve for value in case of cache misses.
   */
  public once<T>(key: string, cacher: Cacher<T>): Promise<T>;
  /**
   * Cache the result of cacher if cache is missed from the caching souce
   *
   * @param key - key to lookup for the cache
   * @param ttl - compute ttl based on received payload, useful if the received payload is a accessToken (with expiration)
   * @param cacher - callback to resolve for value in case of cache misses.
   */
  // eslint-disable-next-line prettier/prettier
  public once<T>(key: string, ttl: TTLResolver<T>, cacher: Cacher<T>): Promise<T>;
  /**
   * Cache the result of cacher if cache is missed from the caching source
   *
   * @param key - key to lookup for the cache
   * @param ttl - static TTL use for storing thie cache
   * @param cacher - callback to resolve for value in case of cache misses.
   */
  public once<T>(key: string, ttl: number, cacher: Cacher<T>): Promise<T>;
  /**
   * Cache the result of cacher if cache is missed from the caching source
   *
   * @param key - key to lookup for the cache
   * @param options - cache options defined.
   * @param cacher - callback to resolve for value in case of cache misses.
   */
  public once<T>(key: string, options: OnceOptions<T>, cacher: Cacher<T>): Promise<T>;
  // implementation interface.
  async once<T>(
    key: string,
    ttlOrCacher: number | Cacher<T> | TTLResolver<T> | OnceOptions<T>,
    cacherOrUndefined?: Cacher<T>,
  ): Promise<T> {
    const cacher = typeof cacherOrUndefined !== 'undefined' ? cacherOrUndefined : <Cacher<T>>ttlOrCacher;
    const options = toOnceOptions(typeof cacherOrUndefined !== 'undefined' ? <OnceOptionFormat<T>>ttlOrCacher : {});
    if (!options.ignoreCache) {
      const inCache = await this.getData(key);
      if (inCache) {
        this.logger.log(`Cache H ${key}`);
        return inCache;
      }
    }
    const val = await cacher();
    const ttlInSeconds = Math.floor(options.ttl(val));
    this.logger.log(`Cache M ${key} (ttl=${ttlInSeconds}s)`);
    this.setData(key, val, ttlInSeconds);
    return val;
  }
}
