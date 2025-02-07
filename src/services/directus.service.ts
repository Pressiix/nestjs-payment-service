import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigServiceType } from './config.service';
import axios, { AxiosInstance } from 'axios';
import { TokenPackageResponse } from 'src/models/response/token-package.response';

@Injectable()
export class DirectusService {
  private readonly logger = new Logger(DirectusService.name);
  private directus: AxiosInstance;

  constructor(@Inject('CONFIG') private config: ConfigServiceType) {
    this.directus = axios.create({
      baseURL: this.config.get('CMS_BASE_URL'),
      headers: {
        Authorization: `Bearer ${this.config.get('DIRECTUS_ADMIN_TOKEN')}`,
      },
    });
    this.logger.log('Initialized Directus service');
  }

  getInstance() {
    return this.directus;
  }

  async getTokenPackageById(id: number): Promise<TokenPackageResponse> {
    try {
      const packages = await this.directus.get(
        `/items/token_packages/${id}?fields=*,payment_bonus.*,payment_bonus.payments_id.slug,token.*&filter[_and][0][_and][0][status][_eq]=Active`,
      );
      return packages.data.data;
    } catch (e) {
      throw new HttpException('Invalid Product', HttpStatus.BAD_REQUEST);
    }
  }
}
