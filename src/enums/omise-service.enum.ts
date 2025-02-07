export enum ChargeStatuses {
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  PENDING = 'pending',
  REFUND = 'refund',
  SUCCESSFUL = 'successful',
}

export enum Providers {
  OMISE = 'omise',
}

// related to https://docs.opn.ooo/api-webhooks#supported-events
export enum OmiseCallbackEvents {
  CHARGE = 'charge',
  CARD = 'card',
  CUSTOMER = 'customer',
  DISPUTE = 'dispute',
  LINK = 'link',
  LINKED_ACCOUNT = 'linked_account',
  TRANSFER = 'transfer',
  RECIPIENT = 'recipient',
  REFUND = 'refund',
  SCHEDULED = 'scheduled',
}

// related to https://docs.opn.ooo/api-webhooks#charge-events
export enum OmiseChargeEvents {
  CAPTURE = 'charge.capture',
  COMPLETE = 'charge.complete',
  CREATE = 'charge.create',
  EXPIRE = 'charge.expire',
  REVERSE = 'charge.reverse',
  UPDATE = 'charge.update',
}
