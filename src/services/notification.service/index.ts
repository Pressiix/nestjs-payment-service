import { ChargeCompletePayloadBuilder } from './builders';
import { PushNotificationPayloadCollectionV2, PushNotificationPayloadV2 } from './types';
import { Options } from './types';
import { ChargeStatuses } from 'src/enums/omise-service.enum';
import axios, { AxiosInstance } from 'axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigServiceType } from '../config.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private _instance: AxiosInstance;

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this._instance = axios.create({
      baseURL: this.config.get('NOTIFICATION_SERVICE_URL'),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': this.config.get('NOTIFICATION_SERVICE_API_KEY'),
      },
    });
    this.logger.log('Initialized Notification service');
  }

  getInstance() {
    return this._instance;
  }

  public async pushNotification(pushNotificationPayload: PushNotificationPayloadV2 | null) {
    if (!pushNotificationPayload) {
      throw new Error(`No tag found.`);
    }

    try {
      await this._instance.post('/api/notification/v1/push', pushNotificationPayload);
      this.logger.log(`Sent push with ${JSON.stringify(pushNotificationPayload)}`);
    } catch (error) {
      throw error;
    }
  }

  public async pushNotificationCollection(pushNotificationPayloadCollection: PushNotificationPayloadCollectionV2) {
    if (!pushNotificationPayloadCollection.notifications.length) {
      throw new Error(`No valid event found.`);
    }

    try {
      await this._instance.post('/api/notification/v1/schedule', pushNotificationPayloadCollection);
      this.logger.log(`Sent push schedule with ${JSON.stringify(pushNotificationPayloadCollection)}`);
    } catch (error) {
      throw error;
    }
  }

  public async buildNotificationPayload(options: Options) {
    const { type, data } = options;

    if (type !== ChargeStatuses.SUCCESSFUL && type !== ChargeStatuses.FAILED) {
      throw new Error(`Invalid event type ${type}`);
    }

    return ChargeCompletePayloadBuilder({
      type,
      item: data,
      options: {
        icon: this.config.get('NOTIFICATION_PAYMENT_ICON'),
        deeplinkUrl: this.config.get('NOTIFICATION_DEEPLINK_URL'),
        fallbackUrl: this.config.get('NOTIFICATION_FALLBACK_URL'),
      },
    });
  }
}
