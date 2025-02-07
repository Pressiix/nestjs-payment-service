import { sprintf } from 'sprintf-js';
import { SqsMessageParams } from 'src/types/params.type';
import { DefaultMessage, DefaultNotificationOptions, MessageTemplates, UrlTemplates } from '../constants';
import {
  NotificationActionTypes,
  NotificationDeliveryChannels,
  NotificationDestinations,
  NotificationSources,
  PayloadBuilderParams,
  PushNotificationPayloadV2,
} from '../types';

export const ChargeCompletePayloadBuilder = (
  payloadBuilderParams: PayloadBuilderParams,
): PushNotificationPayloadV2 | null => {
  const { type, item, scheduleTime, options } = payloadBuilderParams;
  const { icon, deeplinkUrl, fallbackUrl } = {
    ...DefaultNotificationOptions,
    ...options,
  };

  const {
    userRef,
    tokenSymbol: coinName,
    attribute: {
      transactionId,
      metadata: { coinValue },
    },
  }: SqsMessageParams = item;
  if (!userRef) return null;

  // Build content url
  const chargeStatus = type.toUpperCase();
  const urlTemplate = `${deeplinkUrl}${UrlTemplates[chargeStatus] ?? ''}`;
  const contentUrl = sprintf(urlTemplate, { txId: transactionId });

  const messageTemplate = {
    ...DefaultMessage,
    ...MessageTemplates[chargeStatus],
  };

  const enMessage = sprintf(messageTemplate.en, {
    coinValue,
    coinName,
  });
  const thMessage = sprintf(messageTemplate.th, {
    coinValue,
    coinName,
  });

  const pushNotificationPayload = {
    userRef: [userRef],
    destinationType: NotificationDestinations.USER,
    templateId: null,
    message: {
      en: enMessage,
      th: thMessage,
    },
    isOverrideMsgRequired: true,
    source: NotificationSources.PAYMENT_SERVICE,
    icon,
    deliveryChannels: [NotificationDeliveryChannels.INBOX, NotificationDeliveryChannels.PUSH],
    action: {
      type: NotificationActionTypes.DEEPLINK,
      content: contentUrl,
      fallbackUrl: fallbackUrl,
    },
    metadata: { transactionId },
    ...(scheduleTime && { scheduleTime }),
  } as PushNotificationPayloadV2;

  return pushNotificationPayload;
};
