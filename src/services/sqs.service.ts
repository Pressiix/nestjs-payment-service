import { Inject, Injectable, Logger } from '@nestjs/common';
import { logSqsSender } from 'src/logger/logger.util';
import {} from '../configs/constants.config';
import { ConfigServiceType } from './config.service';
import AWS = require('aws-sdk');
import SQS = require('aws-sdk/clients/sqs');

@Injectable()
export class SqsService {
  private readonly logger: Logger = new Logger(SqsService.name);
  private sqs: AWS.SQS;

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this.sqs = new AWS.SQS({
      apiVersion: '2012-11-05',
    });
  }

  async send(msg: SQS.Types.SendMessageRequest) {
    const startExecTime = Date.now();
    this.logger.log('sending message ..');
    this.logger.debug(`Message : ${JSON.stringify(msg)}`);
    const send = await this.sqs.sendMessage(msg).promise();
    logSqsSender(msg.QueueUrl, msg.MessageBody, startExecTime);
    return send;
  }

  async sendSampleProcessorEvent(msg: any) {
    const sendMsg = {
      MessageBody: JSON.stringify(msg),
      QueueUrl: this.config.get('AWS_SQS_PAYMENT_QUEUE'),
    } as SQS.Types.SendMessageRequest;
    return this.send(sendMsg);
  }
}
