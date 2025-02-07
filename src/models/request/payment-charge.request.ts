import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentChargeRequest {

  @IsNotEmpty()
  @IsString()
  txId: string;

  @IsNotEmpty()
  @IsString()
  source: string;
  
}
