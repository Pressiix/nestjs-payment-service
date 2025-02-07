import { Body, Controller, Headers, Post } from '@nestjs/common';
import { OmiseCallbackEvents } from 'src/enums/omise-service.enum';
import { CallbackService } from 'src/services/callback.service';

@Controller('/payment/callback')
export class CallbackController {
  constructor(private readonly callbackService: CallbackService) {}
  // TODO (@watcharaphonp): validate root level of body using Pipe Validator
  @Post('omise')
  async handleOmiseCallBack(@Body() body: any, @Headers() headers: Record<string, string>) {
    // Handle the charge event
    if (body && body.data && body.data.object === OmiseCallbackEvents.CHARGE) {
      const { data } = body;
      const { id: chargeId } = data;
      const eventKey = body.key;
      const requestedAgent = headers['user-agent'];

      // Validate charge event
      await this.callbackService.validateChargeEvent(chargeId, requestedAgent, eventKey);
      // Create transaction
      await this.callbackService.createTransactionLog(data, eventKey);
    }

    return { received: true };
  }
}
