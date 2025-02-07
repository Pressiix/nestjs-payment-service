import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction-log.entity';
import { TransactionStatus } from 'src/entities/transaction-status.entity';
import { ChargeStatuses, Providers } from 'src/enums/omise-service.enum';
import { PaymentTypeEnum } from 'src/enums/payment-type.enum';
import { ServiceTokenEnum } from 'src/enums/service-token.enum';
import { OmiseService } from 'src/services/omise.service';
import { PaymentService } from 'src/services/payment.service';
import { Repository } from 'typeorm';

describe('PaymentService', () => {
  let service: PaymentService;
  let transactionStatusRepository: Repository<TransactionStatus>;
  let transactionLogRepository: Repository<TransactionLog>;
  let omiseService: OmiseService;
  let config: ConfigService;

  const TRANSACTION_STATUS_REPOSITORY_TOKEN = getRepositoryToken(TransactionStatus);
  const TRANSACTION_LOG_REPOSITORY_TOKEN = getRepositoryToken(TransactionLog);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ServiceTokenEnum.PAYMENT_LOGGER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: 'CONFIG',
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'OMISE_RETURN_URI':
                  return 'http://somehost.com/payment/complete';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: TRANSACTION_STATUS_REPOSITORY_TOKEN,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(() =>
              Promise.resolve({
                id: 'transaction_status_id',
              }),
            ),
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
            createCharge: jest.fn(
              ({ source, card, return_uri }: { source: string; card: string; return_uri: string }) => {
                return {
                  id: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                  amount: 100,
                  currency: 'USD',
                  source: source?.includes('source_token')
                    ? {
                        id: source,
                        scannable_code: {
                          image: 'https://example.com/qr.png',
                        },
                      }
                    : {
                        id: source,
                      },
                  card: card
                    ? {
                        id: card,
                      }
                    : null,
                  description: 'Test charge',
                  status: source === null ? ChargeStatuses.SUCCESSFUL : ChargeStatuses.PENDING,
                  return_uri,
                  authorize_uri: return_uri ? 'https://example.com/authorize_uri' : null,
                  metadata: {
                    userRefId: 'XXXXXXXX',
                    sourceId: source,
                  },
                };
              },
            ),
            findPaymentTypeFromSourceId: jest.fn(),
          },
        },
      ],
    }).compile();

    config = module.get<ConfigService>('CONFIG');
    service = module.get<PaymentService>(PaymentService);
    transactionStatusRepository = module.get<Repository<TransactionStatus>>(TRANSACTION_STATUS_REPOSITORY_TOKEN);
    transactionLogRepository = module.get<Repository<TransactionLog>>(TRANSACTION_LOG_REPOSITORY_TOKEN);
    omiseService = module.get<OmiseService>(ServiceTokenEnum.OMISE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('charge', () => {
    const mockPaymentType = (paymentType: PaymentTypeEnum | null) => {
      (omiseService.findPaymentTypeFromSourceId as jest.Mock).mockImplementation(() => {
        return paymentType;
      });
    };

    it('should throw error when payment type is not supported', async () => {
      mockPaymentType(null);
      const chargeDetails = {
        amount: 100,
        currency: 'USD',
        source: 'source_token',
        description: 'Test charge',
        userRefId: 'XXXXXXXX',
        productId: 'product_XXXXXX',
      };

      await expect(service.charge(chargeDetails)).rejects.toThrow();
    });

    it('should save transaction status successfully', async () => {
      mockPaymentType(PaymentTypeEnum.QR);
      const chargeDetails = {
        amount: 100,
        currency: 'USD',
        source: 'source_token',
        description: 'Test charge',
        userRefId: 'XXXXXXXX',
        productId: 'product_XXXXXX',
      };

      await service.charge(chargeDetails);

      expect(transactionLogRepository.create).toHaveBeenCalled();
      expect(transactionStatusRepository.create).toHaveBeenCalled();
      expect(transactionStatusRepository.save).toHaveBeenCalled();
    });

    it('should throw error when create charge failed', async () => {
      omiseService.createCharge = jest.fn(() => {
        throw new Error('Failed to create charge');
      });
      mockPaymentType(PaymentTypeEnum.QR);

      const chargeDetails = {
        amount: 100,
        currency: 'USD',
        source: 'source_token',
        description: 'Test charge',
        userRefId: 'XXXXXXXX',
        productId: 'product_XXXXXX',
      };

      await expect(service.charge(chargeDetails)).rejects.toThrow('Failed to create charge');
    });

    it('should throw error when save transaction status failed', async () => {
      transactionStatusRepository.save = jest.fn(() => {
        throw new Error('Failed to save transaction status');
      });
      mockPaymentType(PaymentTypeEnum.QR);

      const chargeDetails = {
        amount: 100,
        currency: 'USD',
        source: 'source_token',
        description: 'Test charge',
        userRefId: 'XXXXXXXX',
        productId: 'product_XXXXXX',
      };

      await expect(service.charge(chargeDetails)).rejects.toThrow('Failed to save transaction status');
    });

    it('should throw http exception when passing incorrect payment type to service.charge', async () => {
      mockPaymentType(null);
      const chargeDetails = {
        amount: 100,
        currency: 'USD',
        source: 'true_money_token',
        description: 'Test charge',
        userRefId: 'XXXXXXXX',
        productId: 'product_XXXXXX',
      };

      try {
        await service.charge(chargeDetails);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual('Invalid payment type');
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    describe('with QR', () => {
      it('should call Omise with correct parameters', async () => {
        mockPaymentType(PaymentTypeEnum.QR);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'source_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        await service.charge(chargeDetails);

        expect(omiseService.createCharge).toHaveBeenCalledWith({
          amount: 100,
          currency: 'USD',
          source: 'source_token',
          card: null,
          return_uri: null,
          description: 'Test charge',
          metadata: {
            userRefId: 'XXXXXXXX',
            sourceId: 'source_token',
            productId: 'product_XXXXXX',
          },
        });
      });

      it('should return valid result', async () => {
        mockPaymentType(PaymentTypeEnum.QR);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'source_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        const chargeResult = await service.charge(chargeDetails);

        expect(chargeResult).toBeInstanceOf(Object);
        expect(chargeResult.status).toEqual(ChargeStatuses.PENDING);
        expect(chargeResult.details).toEqual({
          transactionId: 'transaction_status_id',
          paymentType: PaymentTypeEnum.QR,
          amount: 100,
          currency: 'USD',
          source: 'source_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          provider: Providers.OMISE,
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            image: 'https://example.com/qr.png',
            authorizeUri: null,
            returnUri: null,
          },
          productId: 'product_XXXXXX',
        });
      });
    });

    describe('with CARD', () => {
      it('should call Omise with correct parameters', async () => {
        mockPaymentType(PaymentTypeEnum.CARD);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'card_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        await service.charge(chargeDetails);

        expect(omiseService.createCharge).toHaveBeenCalledWith({
          amount: 100,
          currency: 'USD',
          source: null,
          card: 'card_token',
          return_uri: expect.anything(),
          description: 'Test charge',
          metadata: {
            userRefId: 'XXXXXXXX',
            sourceId: 'card_token',
            productId: 'product_XXXXXX',
          },
        });
      });

      it('should return valid result', async () => {
        mockPaymentType(PaymentTypeEnum.CARD);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'card_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        const chargeResult = await service.charge(chargeDetails);

        expect(chargeResult).toBeInstanceOf(Object);
        expect(chargeResult.status).toEqual(ChargeStatuses.SUCCESSFUL);
        expect(chargeResult.details).toEqual({
          transactionId: 'transaction_status_id',
          paymentType: PaymentTypeEnum.CARD,
          amount: 100,
          currency: 'USD',
          source: 'card_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          provider: Providers.OMISE,
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            image: undefined,
            authorizeUri: expect.any(String),
            returnUri: expect.any(String),
          },
          productId: 'product_XXXXXX',
        });
      });
    });

    describe('with TRUE_MONEY', () => {
      it('should call Omise with correct parameters', async () => {
        mockPaymentType(PaymentTypeEnum.TRUE_MONEY);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'true_money_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        await service.charge(chargeDetails);

        await expect(omiseService.createCharge).toHaveBeenCalledWith({
          amount: 100,
          currency: 'USD',
          source: 'true_money_token',
          card: null,
          return_uri: config.get('OMISE_RETURN_URI'),
          description: 'Test charge',
          metadata: {
            userRefId: 'XXXXXXXX',
            sourceId: 'true_money_token',
            productId: 'product_XXXXXX',
          },
        });
      });

      it('should return valid result', async () => {
        mockPaymentType(PaymentTypeEnum.TRUE_MONEY);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'true_money_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        const chargeResult = await service.charge(chargeDetails);

        expect(chargeResult).toBeInstanceOf(Object);
        expect(chargeResult.status).toEqual(ChargeStatuses.PENDING);
        expect(chargeResult.details).toEqual({
          transactionId: 'transaction_status_id',
          paymentType: PaymentTypeEnum.TRUE_MONEY,
          amount: 100,
          currency: 'USD',
          source: 'true_money_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          provider: Providers.OMISE,
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            image: undefined,
            authorizeUri: expect.any(String),
            returnUri: expect.any(String),
          },
          productId: 'product_XXXXXX',
        });
      });
    });

    describe('with LINE_PAY', () => {
      it('should call Omise with correct parameters', async () => {
        mockPaymentType(PaymentTypeEnum.LINE_PAY);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'line_pay_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        await service.charge(chargeDetails);

        await expect(omiseService.createCharge).toHaveBeenCalledWith({
          amount: 100,
          currency: 'USD',
          source: 'line_pay_token',
          card: null,
          return_uri: config.get('OMISE_RETURN_URI'),
          description: 'Test charge',
          metadata: {
            userRefId: 'XXXXXXXX',
            sourceId: 'line_pay_token',
            productId: 'product_XXXXXX',
          },
        });
      });
      it('should return valid result ', async () => {
        mockPaymentType(PaymentTypeEnum.LINE_PAY);
        const chargeDetails = {
          amount: 100,
          currency: 'USD',
          source: 'line_pay_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          productId: 'product_XXXXXX',
        };

        const chargeResult = await service.charge(chargeDetails);

        expect(chargeResult).toBeInstanceOf(Object);
        expect(chargeResult.status).toEqual(ChargeStatuses.PENDING);
        expect(chargeResult.details).toEqual({
          transactionId: 'transaction_status_id',
          paymentType: PaymentTypeEnum.LINE_PAY,
          amount: 100,
          currency: 'USD',
          source: 'line_pay_token',
          description: 'Test charge',
          userRefId: 'XXXXXXXX',
          provider: Providers.OMISE,
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          metadata: {
            image: undefined,
            authorizeUri: expect.any(String),
            returnUri: expect.any(String),
          },
          productId: 'product_XXXXXX',
        });
      });
    });

    describe('with BANK', () => {
      const noneBanklist = [
        PaymentTypeEnum.QR,
        PaymentTypeEnum.CARD,
        PaymentTypeEnum.TRUE_MONEY,
        PaymentTypeEnum.LINE_PAY,
      ];

      Object.values(PaymentTypeEnum).forEach((paymentType: PaymentTypeEnum) => {
        if (!noneBanklist.includes(paymentType)) {
          it('should call Omise with correct parameters', async () => {
            mockPaymentType(paymentType);
            const chargeDetails = {
              amount: 100,
              currency: 'USD',
              source: 'bank_token',
              description: 'Test charge',
              userRefId: 'XXXXXXXX',
              productId: 'product_XXXXXX',
            };

            await service.charge(chargeDetails);

            await expect(omiseService.createCharge).toHaveBeenCalledWith({
              amount: 100,
              currency: 'USD',
              source: 'bank_token',
              card: null,
              return_uri: config.get('OMISE_RETURN_URI'),
              description: 'Test charge',
              metadata: {
                userRefId: 'XXXXXXXX',
                sourceId: 'bank_token',
                productId: 'product_XXXXXX',
              },
            });
          });

          it('should return valid result ', async () => {
            mockPaymentType(paymentType);
            const chargeDetails = {
              amount: 100,
              currency: 'USD',
              source: 'bank_token',
              description: 'Test charge',
              userRefId: 'XXXXXXXX',
              productId: 'product_XXXXXX',
            };

            const chargeResult = await service.charge(chargeDetails);

            expect(chargeResult).toBeInstanceOf(Object);
            expect(chargeResult.status).toEqual(ChargeStatuses.PENDING);
            expect(chargeResult.details).toEqual({
              transactionId: 'transaction_status_id',
              paymentType: paymentType,
              amount: 100,
              currency: 'USD',
              source: 'bank_token',
              description: 'Test charge',
              userRefId: 'XXXXXXXX',
              provider: Providers.OMISE,
              providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              metadata: {
                image: undefined,
                authorizeUri: expect.any(String),
                returnUri: expect.any(String),
              },
              productId: 'product_XXXXXX',
            });
          });
        }
      });
    });
  });

  describe('find transaction by id', () => {
    it('should call repository.findOne with correct params', async () => {
      const transactionId = '537c6505-1387-45b6-a803-f8b256b87235';

      await service.findTransactionById(transactionId);

      expect(transactionStatusRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: transactionId,
        },
        relations: ['transactionLogs'],
      });
    });

    it('should return transaction status when found', async () => {
      const transactionId = '537c6505-1387-45b6-a803-f8b256b87235';
      const transactionStatus: TransactionStatus = {
        id: transactionId,
        paymentType: PaymentTypeEnum.QR,
        amount: 100,
        currency: 'USD',
        source: 'source_token',
        userRefId: 'XXXXXXXX',
        status: ChargeStatuses.SUCCESSFUL,
        provider: Providers.OMISE,
        providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        metadata: {},
        transactionLogs: [],
        createdAt: new Date(),
        productId: 'product_XXXXXX',
      };

      transactionStatusRepository.findOne = jest.fn(() => Promise.resolve(transactionStatus));

      const result = await service.findTransactionById(transactionId);

      expect(result).toEqual(transactionStatus);
    });

    it('should return null when transaction status not found', async () => {
      const transactionId = '537c6505-1387-45b6-a803-f8b256b87235';

      transactionStatusRepository.findOne = jest.fn(() => Promise.resolve(null));

      const result = await service.findTransactionById(transactionId);

      expect(result).toBeNull();
    });
  });
});
