import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DEFAULT_SQS_MESSAGE_PAYMENT_TYPE,
  DEFAULT_SQS_MESSAGE_TRANSACTION_TYPE,
  DEFAULT_SQS_MESSAGE_TRANSFER_TYPE,
} from 'src/configs/constants.config';
import { TransactionLog } from 'src/entities/transaction-log.entity';
import { TransactionStatus } from 'src/entities/transaction-status.entity';
import { ChargeStatuses, OmiseCallbackEvents, OmiseChargeEvents, Providers } from 'src/enums/omise-service.enum';
import { ServiceTokenEnum } from 'src/enums/service-token.enum';
import { SqsMessageParams, transactionMetadataParams } from 'src/types/params.type';
import { Repository } from 'typeorm';
import { ConfigServiceType } from './config.service';
import { NotificationService } from './notification.service';
import { OmiseService } from './omise.service';
import { SqsService } from './sqs.service';

@Injectable()
export class CallbackService {
  constructor(
    @Inject(ServiceTokenEnum.PAYMENT_LOGGER) private readonly logger: Logger,
    @Inject('CONFIG') private config: ConfigServiceType,
    @InjectRepository(TransactionLog) private TransactionLogRepository: Repository<TransactionLog>,
    @InjectRepository(TransactionStatus) private TransactionStatusRepository: Repository<TransactionStatus>,
    @Inject(ServiceTokenEnum.OMISE) private omiseService: OmiseService,
    @Inject(ServiceTokenEnum.SQS) private readonly sqsService: SqsService,
    @Inject(ServiceTokenEnum.NOTIFICATION) private readonly notificationService: NotificationService,
  ) {
    this.logger.log('Initialized callback service');
  }

  async validateChargeEvent(chargeId: string, requestedAgent: string, eventKey: string): Promise<void> {
    if (!chargeId) {
      throw new HttpException('Charge id is undefined', HttpStatus.BAD_REQUEST);
    }
    if (!requestedAgent) {
      throw new HttpException('User agent is undefined', HttpStatus.BAD_REQUEST);
    }
    const agentName = requestedAgent.toLowerCase();

    if (!eventKey) {
      throw new HttpException('Event name is undefined', HttpStatus.BAD_REQUEST);
    }
    const eventName = eventKey.toLowerCase();

    if (!agentName.includes(Providers.OMISE)) {
      throw new HttpException(`Invalid user agent: ${agentName}`, HttpStatus.BAD_REQUEST);
    }

    const omiseChargeEventList: string[] = Object.values(OmiseChargeEvents);

    if (
      !eventName.includes(OmiseCallbackEvents.CHARGE) ||
      omiseChargeEventList.every((omiseEvent) => omiseEvent !== eventName)
    ) {
      throw new HttpException(`Invalid event: ${eventName}`, HttpStatus.BAD_REQUEST);
    }
    // Validate Omise Version
    if (agentName !== `${Providers.OMISE}/${this.config.get('OMISE_VERSION')}`) {
      throw new HttpException(`Invalid omise version: ${requestedAgent}`, HttpStatus.BAD_REQUEST);
    }

    try {
      // Validate Charge ID
      await this.omiseService.findCharge(chargeId);
    } catch (error) {
      throw new HttpException(`Cannot find charge: ${chargeId}`, HttpStatus.NOT_FOUND);
    }
  }

  async createTransactionLog(chargeDetails: any, eventKey: string): Promise<void> {
    try {
      // Check if transaction status already exists
      const TransactionStatusInfo: TransactionStatus = await this.TransactionStatusRepository.findOne({
        where: {
          source: chargeDetails.metadata.sourceId,
        },
        relations: ['transactionLogs'],
      });

      // if transaction status does not exist
      if (!TransactionStatusInfo) {
        this.logger.error(`Cannot find transaction status: ${chargeDetails.id}`);
        return;
      }

      // creates new transaction log
      const transactionLogInfo = this.TransactionLogRepository.create({
        eventKey: eventKey,
        createdAt: new Date(),
        channel: 'webhook',
        status: chargeDetails.status,
      });

      // adds new transaction log to transaction status info
      TransactionStatusInfo.transactionLogs = [...TransactionStatusInfo.transactionLogs, ...[transactionLogInfo]];
      // Set transaction status
      TransactionStatusInfo.status = chargeDetails.status;
      // Set provider reference id
      TransactionStatusInfo.providerRefId = chargeDetails.id;
      // Set updated at
      TransactionStatusInfo.updatedAt = new Date();

      // creates new transaction status
      await this.TransactionStatusRepository.save(TransactionStatusInfo);

      // find token package from directus
      const packageId = TransactionStatusInfo.productId;
      const transactionMetadata: transactionMetadataParams =
        TransactionStatusInfo.metadata as transactionMetadataParams;
      const tokenSymbol = transactionMetadata.tokenSymbol;
      const tokenAmount = transactionMetadata.tokenAmount;
      const tokenBonus = transactionMetadata.tokenBonus;
      const price = transactionMetadata.price.toString();
      const currency = transactionMetadata.currency;
      const packageName = tokenBonus ? `${tokenAmount}+${tokenBonus}` : tokenAmount.toString();

      if (chargeDetails.status === ChargeStatuses.SUCCESSFUL || chargeDetails.status === ChargeStatuses.FAILED) {
        this.logger.log('CHARGE COMPLETE---');
        const msg: SqsMessageParams = {
          userRef: chargeDetails.metadata.userRefId,
          tokenSymbol,
          coinValue: (tokenAmount + tokenBonus).toString(),
          attribute: {
            transactionId: TransactionStatusInfo.id,
            transactionType: DEFAULT_SQS_MESSAGE_TRANSACTION_TYPE,
            transferType: DEFAULT_SQS_MESSAGE_TRANSFER_TYPE,
            serviceType: DEFAULT_SQS_MESSAGE_PAYMENT_TYPE,
            referenceId: chargeDetails.id,
            note: chargeDetails.description,
            couponCode: '',
            metadata: {
              packageId,
              packageName,
              coinValue: tokenAmount?.toString() ?? '0',
              bonusCoins: tokenBonus?.toString() ?? '0',
              price,
              currency,
            },
          },
        };

        // sends sample processor event to sqs
        if (chargeDetails.status === ChargeStatuses.SUCCESSFUL) await this.sqsService.sendSampleProcessorEvent(msg);

        const notificationPayload = await this.notificationService.buildNotificationPayload({
          type: chargeDetails.status.toString(),
          data: msg,
        });
        // Push notification
        await this.notificationService.pushNotification(notificationPayload);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
