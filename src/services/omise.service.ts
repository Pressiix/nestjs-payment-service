import { Inject, Injectable, Logger } from '@nestjs/common';
import Omise, { Charges } from 'omise';
import { ConfigServiceType } from './config.service';
import { PaymentTypeEnum } from 'src/enums/payment-type.enum';

@Injectable()
export class OmiseService {
  private readonly logger = new Logger(OmiseService.name);
  private omise: Omise.IOmise;

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this.omise = Omise({
      publicKey: this.config.get('OMISE_PUBLIC_KEY'),
      secretKey: this.config.get('OMISE_SECRET_KEY'),
      omiseVersion: this.config.get('OMISE_VERSION'),
    });
    this.logger.log('Initialized Omise service');
  }

  getInstance() {
    return this.omise;
  }

  createCharge(chargeRequest: Charges.IRequest) {
    return this.getInstance().charges.create(chargeRequest);
  }

  findCharge(chargeId: string) {
    return this.getInstance().charges.retrieve(chargeId);
  }

  async findPaymentTypeFromSourceId(sourceId: string): Promise<PaymentTypeEnum | null> {
    switch (true) {
      case sourceId.startsWith('tokn_'):
        return PaymentTypeEnum.CARD;

      case sourceId.startsWith('src_'):
        return await this.getInstance()
          .sources.retrieve(sourceId)
          .then((source) => source.type as PaymentTypeEnum)
          .catch(() => null);

      case !sourceId:
      case ['src_', 'tokn_'].every((prefix) => !sourceId.startsWith(prefix)):
      default:
        return null;
    }
  }
}
