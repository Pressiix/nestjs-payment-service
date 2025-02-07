import { Controller, Get, Inject } from '@nestjs/common';
import { SqsService } from 'src/services/sqs.service';
import { AppService } from '../services/app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('SQS') private readonly sqsService: SqsService) {}
  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  // example
  @Get('/sendSQS')
  sendSQS(): string {
    this.sqsService.sendSampleProcessorEvent({ message: 'Hello from SQS' });
    return 'success';
  }
}
