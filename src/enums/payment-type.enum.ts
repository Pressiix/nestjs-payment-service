// TODO(@pk3roots): Make it compatible with Omise source types https://docs.opn.ooo/sources-api#create
export enum PaymentTypeEnum {
  QR = 'promptpay',
  CARD = 'credit_card',
  TRUE_MONEY = 'truemoney_jumpapp',
  LINE_PAY = 'rabbit_linepay',
  SCB = 'mobile_banking_scb',
  KBANK = 'mobile_banking_kbank',
  BAY = 'mobile_banking_bay',
  BBL = 'mobile_banking_bbl',
  KTB = 'mobile_banking_ktb',
}
