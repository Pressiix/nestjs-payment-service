import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ACCEPT_LANGUAGE_HEADER, CODE_BUSINESS_ERROR, CODE_TECHNICAL_ERROR } from '../configs/constants.config';
import { ValidationException } from '../exceptions/validation.exception';
import { ResponseStatus } from '../responses/response.status';
import { LookupUtil } from '../utils/lookup.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse<Response>();
    let data = null;
    let status: JSON | ResponseStatus = null;
    const acceptLanguage = request.headers[ACCEPT_LANGUAGE_HEADER];
    if (exception instanceof ValidationException) {
      this.logger.error(`[exception:validate]: ${JSON.stringify(exception)}`);
      status = LookupUtil.getLookup(CODE_BUSINESS_ERROR, acceptLanguage);
    } else if (exception instanceof HttpException) {
      this.logger.error(`[http-exception]: ${exception.stack}`);
      const exceptionResponse = JSON.parse(JSON.stringify(exception.getResponse()));
      if (exception.getStatus() === HttpStatus.OK) {
        if (isNaN(exceptionResponse.status)) {
          status = { ...(exceptionResponse.status as ResponseStatus) };
        } else {
          status = LookupUtil.getLookup(exceptionResponse.status as number, acceptLanguage);
        }
      } else if (exception.getStatus() === HttpStatus.NOT_FOUND) {
        const notFoundResponse = exception.getResponse();
        // logAppRequest(http, notFoundResponse);
        response.status(HttpStatus.OK).send(notFoundResponse);
        return;
      } else {
        status = LookupUtil.getLookup(CODE_TECHNICAL_ERROR, acceptLanguage);
      }
      data = exceptionResponse.data ? exceptionResponse.data : null;
    } else {
      this.logger.error(`[other-exception]: ${exception}`);
      status = LookupUtil.getLookup(CODE_TECHNICAL_ERROR, acceptLanguage);
    }
    const errorData = { status, data };
    // logAppRequest(http, errorData);
    response.status(HttpStatus.OK).send(errorData);
  }
}
