import { Test, TestingModule } from '@nestjs/testing';
import { CallbackController } from 'src/controllers/callback.controller';
import { CallbackService } from 'src/services/callback.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction-log.entity';
import { TransactionStatus } from 'src/entities/transaction-status.entity';
import { ChargeStatuses, OmiseChargeEvents, Providers } from 'src/enums/omise-service.enum';
import { ServiceTokenEnum } from 'src/enums/service-token.enum';
import { ConfigService } from '@nestjs/config';

describe('CallbackController', () => {
  let callbackController: CallbackController;
  let callbackService: CallbackService;
  let config: ConfigService;

  const TRANSACTION_STATUS_REPOSITORY_TOKEN = getRepositoryToken(TransactionStatus);
  const TRANSACTION_LOG_REPOSITORY_TOKEN = getRepositoryToken(TransactionLog);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallbackController],
      providers: [
        {
          provide: ServiceTokenEnum.PAYMENT_LOGGER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        CallbackService,
        {
          provide: 'CONFIG',
          useValue: { get: jest.fn() },
        },
        {
          provide: TRANSACTION_STATUS_REPOSITORY_TOKEN,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TRANSACTION_LOG_REPOSITORY_TOKEN,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ServiceTokenEnum.OMISE,
          useValue: {
            getInstance: jest.fn(),
            createCharge: jest.fn(() => {
              return {
                object: 'charge',
                id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                status: ChargeStatuses.SUCCESSFUL,
              };
            }),
            findCharge: jest.fn(() => {
              return {
                object: 'charge',
                id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                status: ChargeStatuses.SUCCESSFUL,
              };
            }),
          },
        },
        {
          provide: ServiceTokenEnum.SQS,
          useValue: {
            sendSampleProcessorEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    callbackController = module.get<CallbackController>(CallbackController);
    callbackService = module.get<CallbackService>(CallbackService);
    config = module.get<ConfigService>('CONFIG');
  });

  it('should be defined', () => {
    expect(callbackController).toBeDefined();
  });

  describe('handle Omise callback', () => {
    it('should be defined', () => {
      expect(callbackController.handleOmiseCallBack).toBeDefined();
    });

    it('should call callbackService.validateChargeEvent with correct params', async () => {
      callbackService.validateChargeEvent = jest.fn().mockResolvedValue({});

      await callbackController.handleOmiseCallBack(
        {
          data: {
            object: 'charge',
            id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            amount: 1000,
            currency: 'thb',
            source: 'tok_visa',
            description: 'test charge',
            metadata: {
              userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              productId: 'test_product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            },
            status: ChargeStatuses.SUCCESSFUL,
          },
          key: OmiseChargeEvents.CREATE,
        },
        {
          'user-agent': `${Providers.OMISE}/${config.get('OMISE_VERSION')}`,
        },
      );

      expect(callbackService.validateChargeEvent).toHaveBeenCalledWith(
        'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        `${Providers.OMISE}/${config.get('OMISE_VERSION')}`,
        OmiseChargeEvents.CREATE,
      );
    });

    it('should call callbackService.createTransactionLog with correct params', async () => {
      callbackService.createTransactionLog = jest.fn().mockResolvedValue({});
      callbackService.validateChargeEvent = jest.fn().mockResolvedValue({});

      const body = {
        data: {
          object: 'charge',
          id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          amount: 1000,
          currency: 'thb',
          source: 'tok_visa',
          description: 'test charge',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            productId: 'test_product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          status: ChargeStatuses.SUCCESSFUL,
        },
        key: OmiseChargeEvents.CREATE,
      };
      const header = {
        'user-agent': `${Providers.OMISE}/${config.get('OMISE_VERSION')}`,
      };

      await callbackController.handleOmiseCallBack(body, header);

      expect(callbackService.createTransactionLog).toHaveBeenCalledWith(
        {
          object: 'charge',
          id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          amount: 1000,
          currency: 'thb',
          source: 'tok_visa',
          description: 'test charge',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            productId: 'test_product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          status: ChargeStatuses.SUCCESSFUL,
        },
        OmiseChargeEvents.CREATE,
        Providers.OMISE,
      );
    });

    it('should throw error when callbackService.validateChargeEvent returns error', async () => {
      const mockUserAgent = 'Omise/XXXXXXXXXXX';
      callbackService.validateChargeEvent = jest
        .fn()
        .mockRejectedValue(new Error(`Invalid omise version: ${mockUserAgent}`));

      const body = {
        data: {
          object: 'charge',
          id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          amount: 1000,
          currency: 'thb',
          source: 'tok_visa',
          description: 'test charge',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            productId: 'test_product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          status: ChargeStatuses.SUCCESSFUL,
        },
        key: OmiseChargeEvents.CREATE,
      };
      const header = {
        'user-agent': mockUserAgent,
      };

      await expect(callbackController.handleOmiseCallBack(body, header)).rejects.toThrow(
        `Invalid omise version: ${mockUserAgent}`,
      );
    });
  });
});
