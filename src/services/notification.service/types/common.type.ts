// Enumeration
export enum EventTypes {
  CHARGE_SUCCESS = 'charge_success',
  CHARGE_FAILED = 'charge_failed',
}

export enum NotificationSources {
  PAYMENT_SERVICE = 'payment service',
}

export enum NotificationDestinations {
  TAG = 'tag',
  USER = 'user',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum NotificationTemplates {
  EVENT_CREATE_NOTIFY = 'EVENT_CREATE_NOTIFY',
}

export enum NotificationDeliveryChannels {
  PUSH = 'PUSH',
  INBOX = 'INBOX',
}

export enum NotificationActionTypes {
  DEEPLINK = 'deep_link',
}

// Types
export type Options = {
  type: string;
  data: DataObject | EmptyObject | null | undefined;
};

export type DataObject = {
  [key: string]: any;
};

export type EmptyObject = Record<PropertyKey, never>;

export type MessageType = {
  en: string;
  th: string;
};

export type MetadataType = {
  [key: string]: any;
};

export type TranslationMapType = {
  [key: string]: any;
};

export type ActionType = {
  type: NotificationActionTypes;
  content: string;
  fallbackUrl: string;
};

export type NotificationOptionsType = {
  icon: string;
  deeplinkUrl: string;
  fallbackUrl: string;
};

// Interfaces
export interface PayloadBuilderParams {
  type: string;
  item: any;
  scheduleTime?: string;
  options?: NotificationOptionsType;
}

export enum DirectusEventScope {
  CREATE = 'create',
  UPDATE = 'update',
}

export enum PostCommentStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  ARCHIVED = 'archived',
}
