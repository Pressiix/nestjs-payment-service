import { Inject, Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigServiceType } from '../services/config.service';

@Injectable()
export class AWSConfig {
  private readonly logger = new Logger(AWSConfig.name);

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this.initialAWSConfig();
  }

  async initialAWSConfig() {
    AWS.config.update({
      region: this.config.get('AWS_REGION'),
      accessKeyId: this.config.get('AWS_ACCESSKEY'),
      secretAccessKey: this.config.get('AWS_SECRETKEY'),
    });
    this.logger.log('Initialize AWS config');
  }
}
