import { Body, Controller, Get, Param, Post, Headers, HttpException, HttpStatus, Query } from '@nestjs/common';
import { USER_ID_HEADER } from 'src/configs/constants.config';
import { PaymentChargeRequest } from 'src/models/request/payment-charge.request';
import { PaymentPayRequest } from 'src/models/request/payment-pay.request';
import { PaymentService } from 'src/services/payment.service';

@Controller('/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('/pay')
  async createTransaction(@Headers(USER_ID_HEADER) userRefId: string, @Body() payRequest: PaymentPayRequest): Promise<any> {
    return this.paymentService.createPaymentTransaction(userRefId, payRequest.productId, payRequest.paymentType);
  }

  @Post('/charge')
  async charge(@Body() chargeDetails: PaymentChargeRequest): Promise<any> {
    return this.paymentService.charge(chargeDetails);
  }

  @Get('/check/:transactionId')
  async getTransactionById(@Param('transactionId') transactionId: string) {
    return this.paymentService.findTransactionById(transactionId);
  }

  @Get('/user/transactions')
  async getTransactionByUserRefId(@Headers(USER_ID_HEADER) userRefId: string, @Query('offset') offset, @Query('limit') limit) {
    if (!userRefId) {
      throw new HttpException('User Ref ID is undefined', HttpStatus.BAD_REQUEST);
    }
    return await this.paymentService.findTransactionsByUserRefId(userRefId, offset, limit);
  }
}
