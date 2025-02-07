import { Test, TestingModule } from '@nestjs/testing';
import { OmiseService } from 'src/services/omise.service';
import Omise from 'omise';
import { ConfigService } from '@nestjs/config';

jest.mock('omise', () => {
  return jest.fn().mockImplementation(() => {
    return {
      charges: {
        create: jest.fn(() => {
          return {
            object: 'charge',
            location: '/charges/ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            status: 'successful',
          };
        }),
        retrieve: jest.fn(() => {
          return {
            object: 'charge',
            location: '/charges/ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            status: 'successful',
          };
        }),
      },
    };
  });
});

describe('OmiseService', () => {
  let service: OmiseService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OmiseService,
        {
          provide: 'CONFIG',
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OmiseService>(OmiseService);
    config = module.get('CONFIG');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInstance', () => {
    it('should initialize instance successfully', () => {
      expect(Omise).toHaveBeenCalledWith({
        secretKey: config.get('OMISE_SECRET_KEY'),
        omiseVersion: config.get('OMISE_VERSION'),
      });
      expect(service.getInstance()).toBeDefined();
    });
  });

  describe('createCharge', () => {
    it('should create charge successfully', async () => {
      const chargeRequest = {
        amount: 100,
        currency: 'USD',
        source: 'source_token',
        description: 'Test charge',
        userRefId: 'XXXXXXXX',
      };

      const chargeResult = await service.createCharge(chargeRequest);

      expect(chargeResult).toMatchObject({
        id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        status: 'successful',
      });
    });
  });

  describe('retrieveCharge', () => {
    it('should retrieve charge successfully', async () => {
      const chargeResult = await service.findCharge('ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      expect(chargeResult).toMatchObject({
        object: 'charge',
        location: '/charges/ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        status: 'successful',
      });
    });
  });
});
