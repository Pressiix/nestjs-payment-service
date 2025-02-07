import { Module } from '@nestjs/common';
import { BaselineConfig } from '../configs/baseline.config';

@Module({
  providers: [BaselineConfig],
})
export class BaselineModule {}
