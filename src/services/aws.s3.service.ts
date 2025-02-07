import * as AWS from 'aws-sdk';

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { Logger } from '@nestjs/common';
import { CODE_TECHNICAL_ERROR } from '../configs/constants.config';
import { ConfigServiceType } from './config.service';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private awsS3 = new AWS.S3();
  constructor(@Inject('CONFIG') private config: ConfigServiceType) {}

  private async getObject(bucket: string, filePath: string): Promise<JSON> {
    return this.awsS3
      .getObject({
        Bucket: bucket,
        Key: filePath,
      })
      .promise()
      .then((data) => {
        const result = JSON.parse(data.Body.toString());
        return result;
      })
      .catch((error) => {
        this.logger.error('get object to s3 error: ' + error);
        throw new HttpException({ status: CODE_TECHNICAL_ERROR }, HttpStatus.OK);
      });
  }

  public async putObject(data: JSON, filename: string, bucket: string) {
    await this.awsS3
      .putObject({
        Bucket: bucket,
        Key: filename,
        Body: JSON.stringify(data),
        ContentType: 'application/json; charset=utf-8',
      })
      .promise();
  }
}
