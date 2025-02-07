import { Module } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { AwsS3Service } from '../services/aws.s3.service';

@Module({
  providers: [{ provide: 'AWS_S3', useFactory: () => new AWS.S3() }, AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module {}
