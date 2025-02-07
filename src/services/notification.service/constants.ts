import { MessageType, NotificationOptionsType, TranslationMapType } from './types';

export const DefaultNotificationOptions: NotificationOptionsType = {
  icon: '',
  deeplinkUrl: '',
  fallbackUrl: '',
};

export const DefaultTranslation: TranslationMapType = {
  'en-TH': '',
  'th-TH': '',
};

export const DefaultMessage: MessageType = {
  en: '',
  th: '',
};

export const UrlTemplates: Record<string, string> = {
  SUCCESSFUL: '/payment/transaction/%(txId)s',
  FAILED: '/payment/transaction/%(txId)s',
};

export const MessageTemplates: Record<string, MessageType> = {
  SUCCESSFUL: {
    en: 'Your payment for a top-up package of %(coinValue)s %(coinName)s is successful.',
    th: 'Your payment for a top-up package of %(coinValue)s %(coinName)s is successful.',
  },
  FAILED: {
    en: 'Your payment for a top-up package of %(coinValue)s %(coinName)s is failed. Please try again.',
    th: 'Your payment for a top-up package of %(coinValue)s %(coinName)s is failed. Please try again.',
  },
};
