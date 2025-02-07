import { CACHE_MANAGER } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { ConfigServiceType } from '../../../src/services/config.service';
import { CacheManagerService } from '../../../src/services/cache-manager.service';
import { CACHE_KEY_ALL } from '../../../src/configs/constants.config';

describe('CacheManagerService', () => {
  // Setups
  let config: ConfigServiceType;
  let memoryCache: Cache;
  let cacheManagerService: CacheManagerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CacheManagerService,
        { provide: 'CONFIG', useValue: { get: jest.fn() } },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            reset: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    config = module.get('CONFIG');
    memoryCache = module.get(CACHE_MANAGER);
    cacheManagerService = module.get<CacheManagerService>(CacheManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case

  // Get Data
  describe('getData', () => {
    it('should return get key data', async () => {
      jest.spyOn(memoryCache, 'get').mockResolvedValue('key_data');

      const response = await cacheManagerService.getData('key');
      expect(response).toStrictEqual('key_data');
    });
  });

  // Set Data
  describe('setData', () => {
    it('should return set key data', async () => {
      jest.spyOn(config, 'get').mockReturnValue(1);
      jest.spyOn(memoryCache, 'set').mockReturnValue();

      const response = await cacheManagerService.setData('key', 'key_data', 60);
      expect(response).toStrictEqual(undefined);
    });
  });

  // Remove Data
  describe('removeData', () => {
    it('reset should return key', async () => {
      jest.spyOn(memoryCache, 'reset').mockReturnValue();

      const response = await cacheManagerService.removeData(CACHE_KEY_ALL);
      expect(response).toStrictEqual(CACHE_KEY_ALL);
    });

    it('delete should return key', async () => {
      jest.spyOn(memoryCache, 'del').mockResolvedValue('key_data');

      const response = await cacheManagerService.removeData('key');
      expect(response).toStrictEqual('key');
    });
  });

  // Once
  describe('once', () => {
    it('should return cache data', async () => {
      jest.spyOn(memoryCache, 'get').mockResolvedValue('cache_data');

      const response = await cacheManagerService.once('key', 1, (): any => {
        return 'data';
      });
      expect(response).toStrictEqual('cache_data');
    });
    it('should return data without cache', async () => {
      jest.spyOn(memoryCache, 'get').mockResolvedValue(undefined);

      const response = await cacheManagerService.once('key', 1, (): any => {
        return 'data';
      });
      expect(response).toStrictEqual('data');
    });

    it('should return cache data when ttl is functoin', async () => {
      jest.spyOn(memoryCache, 'get').mockResolvedValue('cache_data');

      const response = await cacheManagerService.once(
        'key',
        (): any => {
          return 1;
        },
        (): any => {
          return 'data';
        },
      );
      expect(response).toStrictEqual('cache_data');
    });

    it('should return data when ttl is undefined', async () => {
      jest.spyOn(memoryCache, 'get').mockResolvedValue(null);

      const response = await cacheManagerService.once('key', undefined, (): any => {
        return 'data';
      });
      expect(response).toStrictEqual('data');
    });

    it('should return cache data when cacher is undefined', async () => {
      jest.spyOn(memoryCache, 'get').mockResolvedValue('cache_data');

      const response = await cacheManagerService.once('key', 1, undefined);
      expect(response).toStrictEqual('cache_data');
    });
  });
});
