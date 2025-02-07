import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentPayRequest {

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsString()
  paymentType: string;
  
}
