import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CODE_TECHNICAL_ERROR } from '../configs/constants.config';

export default class TechnicalException extends HttpException {
  private readonly logger = new Logger(TechnicalException.name);

  constructor(message) {
    super({ status: CODE_TECHNICAL_ERROR }, HttpStatus.OK);
    this.logger.error(message);
  }
}
