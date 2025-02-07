import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ACCEPT_LANGUAGE_HEADER,
  ACCEPT_LANGUAGE_LIST,
  CODE_BUSINESS_ERROR,
  CODE_SUCCESS,
  CORRELATION_ID_HEADER,
  DEFAULT_ACCEPT_LANGUAGE,
} from '../configs/constants.config';
import { ResponseModel } from '../responses/response.model';
import { LookupUtil } from '../utils/lookup.util';
import uuid from '../utils/uuid.util';

@Injectable()
export class HttpHeaderInterceptor<T> implements NestInterceptor<T, ResponseModel<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseModel<T>> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const acceptLanguage = request.headers[ACCEPT_LANGUAGE_HEADER];
    if (acceptLanguage) {
      if (!ACCEPT_LANGUAGE_LIST.includes(acceptLanguage.toUpperCase())) {
        request.headers[ACCEPT_LANGUAGE_HEADER] = DEFAULT_ACCEPT_LANGUAGE.toUpperCase();
        throw new HttpException({ status: CODE_BUSINESS_ERROR }, HttpStatus.OK);
      }
      request.headers[ACCEPT_LANGUAGE_HEADER] = acceptLanguage.toUpperCase();
    } else {
      request.headers[ACCEPT_LANGUAGE_HEADER] = DEFAULT_ACCEPT_LANGUAGE.toUpperCase();
    }

    const correlationId = request.headers[CORRELATION_ID_HEADER];
    if (!correlationId) {
      request.headers[CORRELATION_ID_HEADER] = uuid();
    }

    const status = LookupUtil.getLookup(CODE_SUCCESS, request.headers[ACCEPT_LANGUAGE_HEADER]);
    response.status(HttpStatus.OK);
    return next.handle().pipe(
      map((data: any) => {
        if (!data) {
          return { status: status, data: null };
        }
        if (data.status?.code) {
          return { status: data.status, data: data.data };
        }
        return { status: status, data: data };
      }),
    );
  }
}
