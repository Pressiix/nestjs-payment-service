import {
  ActionType,
  EmptyObject,
  MessageType,
  MetadataType,
  NotificationDeliveryChannels,
  NotificationDestinations,
  NotificationSources,
  NotificationTemplates,
} from '.';

/* Notification Payload Format v2
{
  "userRef": [
      "sonray"
  ],
  "destinationType": "SUBSCRIPTION",
  "templateId": null,
  "message": {
      "th": "SQSSS",
      "en": "SQSSS"
  },
  "isOverrideMsgRequired": true,
  "source": "directus",
  "icon": "https://bondbond-dev-directus.treg.tech/assets/2731bb4d-2f17-4b6f-a2ad-0699048aeaf0", 
  "deliveryChannels": [
      "PUSH",
      "INBOX"
  ],
  "action": {
      "type": "deep_link",
      "content": "https://www.deeplink.com",
      "fallbackUrl": "https://www.fallbackUrl.com"
  }
}
*/
export interface PushNotificationPayloadV2 {
  userRef: string[];
  destinationType: NotificationDestinations;
  templateId: NotificationTemplates | null;
  message: MessageType | null;
  isOverrideMsgRequired: boolean;
  source: NotificationSources;
  icon: string;
  deliveryChannels: NotificationDeliveryChannels[];
  action: ActionType;
  metadata: MetadataType | EmptyObject;
  scheduleTime: string | undefined;
}

export interface PushNotificationPayloadCollectionV2 {
  notifications: PushNotificationPayloadV2[];
}
