import { Global, Module } from '@nestjs/common';
import { AwsS3Module } from './aws-s3.module';
import { CacheManagerModule } from './cache-manager.module';
import { ConfigModule } from './config.module';
import { HttpClientModule } from './http-client.module';

@Global()
@Module({
  // imports: [ConfigModule, AwsS3Module, BaselineModule, CacheManagerModule, PromModule, HttpClientModule],
  imports: [ConfigModule, AwsS3Module, CacheManagerModule, HttpClientModule],
  exports: [ConfigModule, AwsS3Module, CacheManagerModule, HttpClientModule],
})
export class CommonModule {}
