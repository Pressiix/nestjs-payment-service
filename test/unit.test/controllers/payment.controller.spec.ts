import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentController } from 'src/controllers/payment.controller';
import { TransactionLog } from 'src/entities/transaction-log.entity';
import { TransactionStatus } from 'src/entities/transaction-status.entity';
import { ChargeStatuses, Providers } from 'src/enums/omise-service.enum';
import { PaymentTypeEnum } from 'src/enums/payment-type.enum';
import { ServiceTokenEnum } from 'src/enums/service-token.enum';
import { PaymentChargeDetailsResponse } from 'src/models/response/payment-charge-details.response';
import { PaymentChargeResponse } from 'src/models/response/payment-charge.response';
import { PaymentService } from 'src/services/payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;

  const TRANSACTION_STATUS_REPOSITORY_TOKEN = getRepositoryToken(TransactionStatus);
  const TRANSACTION_LOG_REPOSITORY_TOKEN = getRepositoryToken(TransactionLog);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: ServiceTokenEnum.PAYMENT_LOGGER,
          useValue: {
            log: jest.fn(),
          },
        },
        PaymentService,
        {
          provide: 'CONFIG',
          useValue: { get: jest.fn() },
        },
        {
          provide: TRANSACTION_STATUS_REPOSITORY_TOKEN,
          useValue: {},
        },
        {
          provide: TRANSACTION_LOG_REPOSITORY_TOKEN,
          useValue: {},
        },
        {
          provide: ServiceTokenEnum.OMISE,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('charge', () => {
    it('should be defined', () => {
      expect(controller.charge).toBeDefined();
    });

    it('should call paymentService.charge with correct params', async () => {
      paymentService.charge = jest.fn().mockResolvedValue({});

      await controller.charge({
        amount: 1000,
        currency: 'thb',
        source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        userRefId: 'XXX',
        productId: 'product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      });

      expect(paymentService.charge).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'thb',
        source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        userRefId: 'XXX',
        productId: 'product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      });
    });

    it('should return a correct response', async () => {
      paymentService.charge = jest.fn().mockResolvedValue(
        Object.assign(new PaymentChargeResponse(), {
          status: ChargeStatuses.SUCCESSFUL,
          details: Object.assign(new PaymentChargeDetailsResponse(), {
            transactionId: 123,
            paymentType: PaymentTypeEnum.QR,
            amount: 1000,
            currency: 'thb',
            source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            userRefId: 'XXX',
            provider: Providers.OMISE,
            providerRefId: 'ch_XXX',
            metadata: expect.anything(),
          }),
        }),
      );

      const result = await controller.charge({
        amount: 1000,
        currency: 'thb',
        source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        userRefId: 'XXX',
        productId: 'product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      });

      expect(result).toBeInstanceOf(PaymentChargeResponse);
    });

    it('should throw an error if paymentService.charge throws an error', async () => {
      paymentService.charge = jest.fn().mockRejectedValue(new Error('Failed to charge'));

      await expect(
        controller.charge({
          amount: 1000,
          currency: 'thb',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          userRefId: 'XXX',
          productId: 'product_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        }),
      ).rejects.toThrow('Failed to charge');
    });
  });

  describe('getTransactionById', () => {
    it('should be defined', () => {
      expect(controller.getTransactionById).toBeDefined();
    });

    it('should call paymentService.findTransactionByProviderId with correct params', () => {
      paymentService.findTransactionById = jest.fn().mockResolvedValue({});

      controller.getTransactionById('537c6505-1387-45b6-a803-f8b256b87235');

      expect(paymentService.findTransactionById).toHaveBeenCalledWith('537c6505-1387-45b6-a803-f8b256b87235');
    });

    it('should return a correct response', async () => {
      paymentService.findTransactionById = jest.fn().mockResolvedValue(
        Object.assign(new TransactionStatus(), {
          id: 123,
          paymentType: PaymentTypeEnum.QR,
          amount: 100,
          currency: 'USD',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          userRefId: 'XXXXXXXX',

          provider: Providers.OMISE,
          providerRefId: 'ch_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

          status: ChargeStatuses.SUCCESSFUL,
          metadata: {},
          transactionLogs: [],

          createdAt: new Date(),
        }),
      );

      const result = await controller.getTransactionById('537c6505-1387-45b6-a803-f8b256b87235');

      expect(result).toBeInstanceOf(TransactionStatus);
    });

    it('should throw an error if paymentService.findTransactionById throws an error', async () => {
      paymentService.findTransactionById = jest.fn().mockRejectedValue(new Error('Failed to get transaction'));

      await expect(controller.getTransactionById('537c6505-1387-45b6-a803-f8b256b87235')).rejects.toThrow(
        'Failed to get transaction',
      );
    });
  });

  describe('getTransactionByUserRefId', () => {
    it('should be defined', () => {
      expect(controller.getTransactionByUserRefId).toBeDefined();
    });

    it('should call paymentService.findTransactionByCustomer with correct params', () => {
      paymentService.findTransactionsByUserRefId = jest.fn().mockResolvedValue({});

      controller.getTransactionByUserRefId('e3beu23ieru2beb2iu');

      expect(paymentService.findTransactionsByUserRefId).toHaveBeenCalledWith('e3beu23ieru2beb2iu');
    });

    it('should return a correct response', async () => {
      paymentService.findTransactionsByUserRefId = jest.fn().mockResolvedValue([
        Object.assign(new TransactionStatus(), {
          id: 123,
          paymentType: PaymentTypeEnum.QR,
          amount: 100,
          currency: 'USD',
          source: 'src_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          userRefId: 'e3beu23ieru2beb2iu',
        }),
      ]);

      const result = await controller.getTransactionByUserRefId('e3beu23ieru2beb2iu');

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(TransactionStatus);
      expect(result[0].userRefId).toBe('e3beu23ieru2beb2iu');
      expect(result[0].id).toBeDefined();
      expect(result[0].paymentType).toBeDefined();
      expect(result[0].amount).toBeDefined();
      expect(result[0].currency).toBeDefined();
      expect(result[0].source).toBeDefined();
    });

    it('should throw an error if paymentService.findTransactionByCustomer throws an error', async () => {
      paymentService.findTransactionsByUserRefId = jest.fn().mockRejectedValue(new Error('Failed to get transaction'));

      await expect(controller.getTransactionByUserRefId('e3beu23ieru2beb2iu')).rejects.toThrow(
        'Failed to get transaction',
      );
    });
  });
});
