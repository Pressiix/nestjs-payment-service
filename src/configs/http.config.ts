import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigServiceType } from '../services/config.service';

@Injectable()
export class HttpConfig implements HttpModuleOptionsFactory {
  private readonly logger = new Logger(HttpConfig.name);

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this.logger.debug('Init HttpConfig');
  }

  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: parseInt(this.config.get('HTTP_TIMEOUT')),
      maxRedirects: parseInt(this.config.get('HTTP_MAX_REDIRECTS')),
    };
  }
}
