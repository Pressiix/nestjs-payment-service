import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionLog } from 'src/entities/transaction-log.entity';
import { TransactionStatus } from 'src/entities/transaction-status.entity';
import { ChargeStatuses, OmiseChargeEvents } from 'src/enums/omise-service.enum';
import { PaymentTypeEnum } from 'src/enums/payment-type.enum';
import { ServiceTokenEnum } from 'src/enums/service-token.enum';
import { PaymentChargeResponse } from 'src/models/response/payment-charge.response';
import { Not, Repository } from 'typeorm';
import { CreatePaymentChargeParams, transactionMetadataParams } from 'src/types/params.type';
import { ConfigServiceType } from './config.service';
import { DirectusService } from './directus.service';
import { OmiseService } from './omise.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('CONFIG') private config: ConfigServiceType,
    @Inject(ServiceTokenEnum.PAYMENT_LOGGER) private readonly logger: Logger,
    @InjectRepository(TransactionStatus) private TransactionStatusRepository: Repository<TransactionStatus>,
    @InjectRepository(TransactionLog) private TransactionLogRepository: Repository<TransactionLog>,
    @Inject(ServiceTokenEnum.OMISE) private omiseService: OmiseService,
    @Inject(ServiceTokenEnum.DIRECTUS) private directusService: DirectusService,
  ) {
    this.logger.log('Initialized payment service');
  }

  private async saveTransactionStatus(
    txId: string,
    source: string,
    providerRefId: string,
    metadata: transactionMetadataParams,
  ): Promise<TransactionStatus> {
    const newTransactionLog = this.TransactionLogRepository.create({
      status: ChargeStatuses.PENDING,
      channel: 'api',
      eventKey: OmiseChargeEvents.CREATE,
      createdAt: new Date(),
    });

    const transaction = await this.TransactionStatusRepository.save({
      id: txId,
      source,
      providerRefId,
      metadata: metadata,
      transactionLogs: [newTransactionLog],
      updated_at: new Date(),
    });
    return transaction;
  }

  async createPaymentTransaction(userRefId: string, productId: number, paymentType: string): Promise<string> {
    const status = ChargeStatuses.PENDING;

    const tokenPackage = await this.directusService.getTokenPackageById(productId);

    // CALCULATE token
    const tokenAmount = tokenPackage.no_of_coins;
    let tokenBonus = tokenPackage.bonus ?? 0;
    if (tokenPackage) {
      const paymentBonus = tokenPackage.payment_bonus.find(
        (paymentBonus) => paymentType == paymentBonus.payments_id.slug,
      );
      tokenBonus += paymentBonus?.amount ?? 0;
    }

    const amount = tokenPackage.price * 100;
    const currency = 'THB';
    const metadata: transactionMetadataParams = {
      tokenName: tokenPackage.token.name,
      tokenSymbol: tokenPackage.token.symbol,
      tokenAmount,
      tokenBonus,
      currency: tokenPackage.currency ?? '',
      price: tokenPackage.price ?? 0,
    };

    const newTransactionStatus = this.TransactionStatusRepository.create({
      paymentType,
      provider: 'omise',
      userRefId,
      amount,
      productId: `${productId}`,
      currency,
      status,
      metadata,
      createdAt: new Date(),
    });

    const { id } = await this.TransactionStatusRepository.save(newTransactionStatus);
    return id;
  }

  async charge(chargeDetails: CreatePaymentChargeParams) {
    const { source, txId } = chargeDetails;
    const paymentType: PaymentTypeEnum | null = await this.omiseService.findPaymentTypeFromSourceId(source);

    if (!paymentType || !Object.values(PaymentTypeEnum).includes(paymentType)) {
      throw new HttpException('Invalid payment type', HttpStatus.BAD_REQUEST);
    }

    const chargingTransaction = await this.TransactionStatusRepository.findOneByOrFail({ id: txId });

    const chargeResult = await this.omiseService.createCharge({
      amount: chargingTransaction.amount,
      currency: chargingTransaction.currency,
      source: paymentType !== PaymentTypeEnum.CARD ? source : null,
      card: paymentType == PaymentTypeEnum.CARD ? source : null,
      return_uri: `${this.config.get('OMISE_RETURN_URI')}?txId=${chargingTransaction.id}`,
      description: chargingTransaction.description,
      metadata: {
        txId: chargingTransaction.id,
        userRefId: chargingTransaction.userRefId,
        sourceId: source,
        productId: chargingTransaction.metadata['productId'],
      },
    });

    const transactionStatus = await this.saveTransactionStatus(chargingTransaction.id, source, chargeResult.id, {
      ...(chargingTransaction.metadata as transactionMetadataParams),
      qr_code: chargeResult.source?.scannable_code || undefined,
      card: chargeResult.card || undefined,
    });

    const chargeResponse: PaymentChargeResponse = {
      status: chargeResult.status,
      details: {
        ...transactionStatus,
        source: source,
        providerRefId: chargeResult.id,
        metadata: {
          image: chargeResult.source?.scannable_code?.image,
          authorizeUri: chargeResult.authorize_uri,
          returnUri: chargeResult.return_uri,
        },
      },
    };

    return chargeResponse;
  }

  async findTransactionById(id: string) {
    return this.TransactionStatusRepository.findOne({
      where: { id },
      relations: ['transactionLogs'],
    });
  }

  async findTransactionsByUserRefId(userRefId: string, offset: number = 0, limit: number = 10) {
    return this.TransactionStatusRepository.find({
      where: { userRefId, status: Not('pending') },
      skip: offset,
      take: limit,
      relations: ['transactionLogs'],
      order: { createdAt: 'DESC' }
    });
  }
}
