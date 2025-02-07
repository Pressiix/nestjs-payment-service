import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AWSConfig } from '../configs/aws.config';
import { configService as ConfigService } from '../services/config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : 'local.env',
      isGlobal: true,
    }),
  ],
  providers: [ConfigService, AWSConfig],
  exports: [ConfigService, AWSConfig],
})
export class ConfigModule {}
