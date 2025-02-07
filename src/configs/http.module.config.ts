import { ConfigServiceType } from '../services/config.service';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';

@Injectable()
export class HttpModuleConfig implements HttpModuleOptionsFactory {
  private readonly logger = new Logger(HttpModuleConfig.name);

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this.logger.debug('Init HttpModuleConfig');
  }

  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: parseInt(this.config.get('HTTP_TIMEOUT')),
      maxRedirects: parseInt(this.config.get('HTTP_MAX_REDIRECTS')),
    };
  }
}
