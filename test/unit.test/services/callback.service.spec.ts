import { Test, TestingModule } from '@nestjs/testing';
import { CallbackService } from 'src/services/callback.service';
import { TransactionLog } from 'src/entities/transaction-log.entity';
import { Repository } from 'typeorm';
import { OmiseService } from 'src/services/omise.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionStatus } from 'src/entities/transaction-status.entity';
import { ChargeStatuses, OmiseChargeEvents, Providers } from 'src/enums/omise-service.enum';
import { ConfigService } from '@nestjs/config';
import { SqsService } from 'src/services/sqs.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ServiceTokenEnum } from 'src/enums/service-token.enum';
import { SqsMessageParams } from 'src/types/params.type';

describe('CallbackService', () => {
  let service: CallbackService;
  let transactionStatusRepository: Repository<TransactionStatus>;
  let transactionLogRepository: Repository<TransactionLog>;
  let sqsService: SqsService;
  let config: ConfigService;
  let omiseService: OmiseService;

  const TRANSACTION_STATUS_REPOSITORY_TOKEN = getRepositoryToken(TransactionStatus);
  const TRANSACTION_LOG_REPOSITORY_TOKEN = getRepositoryToken(TransactionLog);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallbackService,
        {
          provide: ServiceTokenEnum.PAYMENT_LOGGER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: 'CONFIG',
          useValue: { get: jest.fn() },
        },
        {
          provide: TRANSACTION_STATUS_REPOSITORY_TOKEN,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(() =>
              Promise.resolve({
                id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                status: ChargeStatuses.SUCCESSFUL,
                paymentType: 'promptpay',
                currency: 'thb',
                amount: 1000,
                userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                description: 'test charge',
                source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                metadata: {
                  userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                  sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ),
            create: jest.fn(),
            save: jest.fn(() => Promise.resolve({ id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' })),
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
                status: 'successful',
              };
            }),
            findCharge: jest.fn(() => {
              return {
                object: 'charge',
                id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                status: 'successful',
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

    config = module.get<ConfigService>('CONFIG');
    service = module.get<CallbackService>(CallbackService);
    transactionStatusRepository = module.get<Repository<TransactionStatus>>(TRANSACTION_STATUS_REPOSITORY_TOKEN);
    transactionLogRepository = module.get<Repository<TransactionLog>>(TRANSACTION_LOG_REPOSITORY_TOKEN);
    omiseService = module.get<OmiseService>('OMISE');
    sqsService = module.get<SqsService>('SQS');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test Callback Service
  describe('validate charge event', () => {
    it('should throw error when charge id is undefined', async () => {
      const chargeEventParams = {
        chargeId: undefined,
        requestedAgent: Providers.OMISE,
        eventKey: OmiseChargeEvents.CREATE,
      };
      await expect(
        service.validateChargeEvent(
          chargeEventParams.chargeId,
          chargeEventParams.requestedAgent,
          chargeEventParams.eventKey,
        ),
      ).rejects.toThrow('Charge id is undefined');
    });
    it('should throw error when provider is undefined', async () => {
      const chargeEventParams = {
        chargeId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        requestedAgent: undefined,
        eventKey: OmiseChargeEvents.CREATE,
      };
      await expect(
        service.validateChargeEvent(
          chargeEventParams.chargeId,
          chargeEventParams.requestedAgent,
          chargeEventParams.eventKey,
        ),
      ).rejects.toThrow('User agent is undefined');
    });
    it('should throw error when event key is undefined', async () => {
      const chargeEventParams = {
        chargeId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        requestedAgent: `${Providers.OMISE}/${config.get('OMISE_VERSION')}`,
        eventKey: undefined,
      };
      await expect(
        service.validateChargeEvent(
          chargeEventParams.chargeId,
          chargeEventParams.requestedAgent,
          chargeEventParams.eventKey,
        ),
      ).rejects.toThrow('Event name is undefined');
    });
    it('should throw error when event name is invalid', async () => {
      const chargeEventParams = {
        chargeId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        requestedAgent: `${Providers.OMISE}/${config.get('OMISE_VERSION')}`,
        eventKey: 'XXXXXXXXXXXXXXXXXX',
      };
      await expect(
        service.validateChargeEvent(
          chargeEventParams.chargeId,
          chargeEventParams.requestedAgent,
          chargeEventParams.eventKey,
        ),
      ).rejects.toThrow(`Invalid event: ${chargeEventParams.eventKey.toLowerCase()}`);
    });
    it('should throw error when omise version is invalid', async () => {
      const provider = `${Providers.OMISE}/2018-05-29`;
      const chargeEventParams = {
        chargeId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        requestedAgent: provider,
        eventKey: OmiseChargeEvents.CREATE,
      };
      await expect(
        service.validateChargeEvent(
          chargeEventParams.chargeId,
          chargeEventParams.requestedAgent,
          chargeEventParams.eventKey,
        ),
      ).rejects.toThrow(`Invalid omise version: ${provider}`);
    });
    it('charge event should be valid', async () => {
      const chargeEventParams = {
        chargeId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        requestedAgent: `${Providers.OMISE}/${config.get('OMISE_VERSION')}`,
        eventKey: OmiseChargeEvents.CREATE,
      };
      await expect(
        service.validateChargeEvent(
          chargeEventParams.chargeId,
          chargeEventParams.requestedAgent,
          chargeEventParams.eventKey,
        ),
      ).resolves.toBeUndefined();
    });
    it('should throw error not found when charge doest not exist in omise', async () => {
      const chargeEventParams = {
        chargeId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        requestedAgent: `${Providers.OMISE}/${config.get('OMISE_VERSION')}`,
        eventKey: OmiseChargeEvents.CREATE,
      };

      (omiseService.findCharge as jest.Mock).mockImplementation(() => {
        throw new Error('Cannot retrieve charge');
      });

      await expect(
        service.validateChargeEvent(
          chargeEventParams.chargeId,
          chargeEventParams.requestedAgent,
          chargeEventParams.eventKey,
        ),
      ).rejects.toThrow(new HttpException(`Cannot find charge: ${chargeEventParams.chargeId}`, HttpStatus.NOT_FOUND));
    });
  });

  describe('create transaction log', () => {
    it('should complete create transaction log', async () => {
      const chargeDetails = {
        id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        amount: 1000,
        currency: 'thb',
        source: {
          id: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          type: 'promptpay',
        },
        description: 'test charge',
        metadata: {
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        status: ChargeStatuses.SUCCESSFUL,
      };

      (transactionStatusRepository.findOne as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          status: ChargeStatuses.SUCCESSFUL,
          paymentType: 'promptpay',
          currency: 'thb',
          amount: 1000,
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          description: 'test charge',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          transactionLogs: [
            {
              id: 'tl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              status: ChargeStatuses.SUCCESSFUL,
              channel: 'promptpay',
              eventKey: OmiseChargeEvents.CREATE,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        }),
      );

      (transactionLogRepository.create as jest.Mock) = jest.fn(() => ({
        id: 'tl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        status: ChargeStatuses.SUCCESSFUL,
        channel: 'promptpay',
        eventKey: OmiseChargeEvents.CREATE,
        transactionStatus: {
          id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          status: ChargeStatuses.SUCCESSFUL,
          paymentType: 'promptpay',
          currency: 'thb',
          amount: 1000,
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          description: 'test charge',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (transactionStatusRepository.save as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          status: ChargeStatuses.SUCCESSFUL,
          paymentType: 'promptpay',
          currency: 'thb',
          amount: 1000,
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          description: 'test charge',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      (sqsService.sendSampleProcessorEvent as jest.Mock) = jest.fn();

      await service.createTransactionLog(chargeDetails, OmiseChargeEvents.CREATE, Providers.OMISE);
      expect(transactionStatusRepository.findOne).toHaveBeenCalled();
      expect(transactionLogRepository.create).toHaveBeenCalled();
      expect(transactionStatusRepository.save).toHaveBeenCalled();
      expect(sqsService.sendSampleProcessorEvent).toHaveBeenCalled();
    });

    it('should throw error when cannot create transaction log', async () => {
      service.createTransactionLog = jest
        .fn()
        .mockRejectedValue(new Error('Cannot create transaction: cannot create transaction log'));

      const chargeDetails = {
        id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        amount: 1000,
        currency: 'thb',
        source: {
          id: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        description: 'test charge',
        metadata: {
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        status: ChargeStatuses.SUCCESSFUL,
      };

      await expect(
        service.createTransactionLog(chargeDetails, OmiseChargeEvents.CREATE, Providers.OMISE),
      ).rejects.toThrow(
        new HttpException('Cannot create transaction: cannot create transaction log', HttpStatus.BAD_REQUEST),
      );
      expect(transactionStatusRepository.save).not.toHaveBeenCalled();
      expect(sqsService.sendSampleProcessorEvent).not.toHaveBeenCalled();
    });

    it('should throw error when cannot find transaction status', async () => {
      const chargeDetails = {
        id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        amount: 1000,
        currency: 'thb',
        source: {
          id: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        description: 'test charge',
        metadata: {
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        status: ChargeStatuses.SUCCESSFUL,
      };

      service.createTransactionLog = jest
        .fn()
        .mockRejectedValue(new Error(`Cannot find transaction status: ${chargeDetails.id}`));

      await expect(
        service.createTransactionLog(chargeDetails, OmiseChargeEvents.CREATE, Providers.OMISE),
      ).rejects.toThrow(
        new HttpException(`Cannot find transaction status: ${chargeDetails.id}`, HttpStatus.BAD_REQUEST),
      );
      expect(transactionStatusRepository.save).not.toHaveBeenCalled();
      expect(sqsService.sendSampleProcessorEvent).not.toHaveBeenCalled();
    });

    it('should not send message to SQS when charge status is not successful', async () => {
      const chargeDetails = {
        id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        amount: 1000,
        currency: 'thb',
        source: {
          id: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        description: 'test charge',
        metadata: {
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        status: ChargeStatuses.FAILED,
      };

      await service.createTransactionLog(chargeDetails, OmiseChargeEvents.CREATE, Providers.OMISE);
      expect(sqsService.sendSampleProcessorEvent).not.toHaveBeenCalled();
    });

    it('should send message to SQS with correct parameters', async () => {
      const amount = 100000;
      const chargeDetails = {
        id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        amount,
        currency: 'thb',
        source: {
          id: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          type: 'promptpay',
        },
        description: 'test charge',
        metadata: {
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        },
        status: ChargeStatuses.SUCCESSFUL,
      };

      (transactionStatusRepository.findOne as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          status: ChargeStatuses.SUCCESSFUL,
          paymentType: 'promptpay',
          currency: 'thb',
          amount,
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          description: 'test charge',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          transactionLogs: [
            {
              id: 'tl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              status: ChargeStatuses.SUCCESSFUL,
              channel: 'promptpay',
              eventKey: OmiseChargeEvents.CREATE,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        }),
      );

      (transactionLogRepository.create as jest.Mock) = jest.fn(() => ({
        id: 'tl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        status: ChargeStatuses.SUCCESSFUL,
        channel: 'promptpay',
        eventKey: OmiseChargeEvents.CREATE,
        transactionStatus: {
          id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          status: ChargeStatuses.SUCCESSFUL,
          paymentType: 'promptpay',
          currency: 'thb',
          amount,
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          description: 'test charge',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (transactionStatusRepository.save as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          id: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          status: ChargeStatuses.SUCCESSFUL,
          paymentType: 'promptpay',
          currency: 'thb',
          amount,
          userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          description: 'test charge',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            userRefId: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            sourceId: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const sqsMessage: SqsMessageParams = {
        userRef: 'test_user_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        tokenSymbol: 'BBT',
        coinValue: (amount / 100).toString(),
        attribute: {
          transactionId: 'ts_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          transactionType: 'EARN',
          serviceType: 'PAYMENT',
          referenceId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // omise charge id
          note: 'test charge',
          couponCode: '',
        },
      };

      (sqsService.sendSampleProcessorEvent as jest.Mock) = jest.fn();

      await service.createTransactionLog(chargeDetails, OmiseChargeEvents.CREATE, Providers.OMISE);
      expect(sqsService.sendSampleProcessorEvent).toHaveBeenCalledWith(sqsMessage);
    });
  });
});
