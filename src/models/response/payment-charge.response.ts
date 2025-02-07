import { PaymentChargeDetailsResponse } from "./payment-charge-details.response";

export class PaymentChargeResponse {
  public status: string;
  public details: PaymentChargeDetailsResponse;
}
