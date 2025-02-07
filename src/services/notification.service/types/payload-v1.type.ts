import {
  EmptyObject,
  MessageType,
  MetadataType,
  NotificationDestinations,
  NotificationSources,
  NotificationTemplates,
} from '.';

/* Notification Payload Format v1
{
  "userRef": ["bus"], // array of user-uuid or tag
  "destinationType": "tag",  // tag, user
  "templateId": Template Id or null,
  "message": {
    "en" : "Noti message",
    "th" : "ข้อความแจ้งเตือน"
   }, // or null
  "isOverrideMsgRequired": true, // true when overriding template by message
  "source" : "directus", // wallet-service , payment-service ,directus ,mobile
  "metadata" : {
         //optional
  }, // or empty object
  "scheduleTime": "2020-06-03T09:15:00" // only for schedule item
} */
export interface PushNotificationPayloadV1 {
  userRef: string[];
  destinationType: NotificationDestinations;
  templateId: NotificationTemplates | null;
  message: MessageType | null;
  isOverrideMsgRequired: boolean;
  source: NotificationSources;
  metadata: MetadataType | EmptyObject;
  scheduleTime: string | undefined;
}

export interface PushNotificationPayloadCollectionV1 {
  notifications: PushNotificationPayloadV1[];
}
