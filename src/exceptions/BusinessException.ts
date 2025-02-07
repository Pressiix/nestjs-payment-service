import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CODE_BUSINESS_ERROR } from '../configs/constants.config';

export default class BusinessException extends HttpException {
  private readonly logger = new Logger(BusinessException.name);

  constructor(message) {
    super({ status: CODE_BUSINESS_ERROR }, HttpStatus.OK);
    this.logger.error(message);
  }
}
