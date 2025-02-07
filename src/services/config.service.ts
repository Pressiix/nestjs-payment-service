import { Provider, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService, NoInferType } from '@nestjs/config';
import { IS_EMPTY_VAULT_CONFIG } from '../configs/constants.config';

export type ConfigServiceType = {
  get<T>(propertyPath: string, defaultValue?: NoInferType<T>): T;
};

@Injectable()
class ConfigWithVaultService implements ConfigServiceType {
  private readonly logger = new Logger(ConfigWithVaultService.name);

  constructor(
    private defaultConfigService: ConfigService,
    @Inject('VAULT_CONFIG') private secretConfig: { [key: string]: any },
  ) {
    this.logger.debug(`Init ConfigWithVaultService`);
  }

  get<T>(propertyPath: string, defaultValue?: NoInferType<T>): T | undefined {
    return this.secretConfig[propertyPath]
      ? this.secretConfig[propertyPath]
      : this.defaultConfigService.get(propertyPath, defaultValue);
  }
}

@Injectable()
class DefaultConfigService implements ConfigServiceType {
  private readonly logger = new Logger(DefaultConfigService.name);

  constructor(private defaultConfigService: ConfigService) {
    this.logger.debug(`Init DefaultConfigService`);
  }

  get<T>(propertyPath: string, defaultValue?: NoInferType<T>): T | undefined {
    return this.defaultConfigService.get(propertyPath, defaultValue);
  }
}

export const configService: Provider = {
  provide: 'CONFIG',
  useClass: IS_EMPTY_VAULT_CONFIG ? DefaultConfigService : ConfigWithVaultService,
};
