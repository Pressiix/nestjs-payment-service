export class PaymentChargeDetailsResponse {
  public transactionId?: string;
  public paymentType: string;
  public amount: number;
  public currency: string;
  public source: string;
  public description?: string;
  public userRefId: string;
  public productId: string;
  public provider: string;
  public providerRefId: string;
  public metadata: object;
}
