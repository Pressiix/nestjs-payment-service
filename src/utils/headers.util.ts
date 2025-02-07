import {
  ACCEPT_LANGUAGE_HEADER,
  CORRELATION_ID_HEADER,
  DEFAULT_ACCEPT_LANGUAGE,
  USER_ID_HEADER,
} from '../configs/constants.config';
import uuid from './uuid.util';

export class HeadersUtil {
  static createNewRequestHeaders(headers: any): any {
    let newHeaders = headers;
    const correlationId = headers[CORRELATION_ID_HEADER] ?? uuid();
    const language = headers[ACCEPT_LANGUAGE_HEADER] ?? DEFAULT_ACCEPT_LANGUAGE;
    const userId = headers[USER_ID_HEADER];
    if (userId) {
      newHeaders = { ...newHeaders, userid: userId };
    }
    return {
      ...newHeaders,
      'accept-language': language,
      correlationid: correlationId,
      requestTime: Date.now(),
    };
  }

  static buildRequestHeaders(userId?: string, correlationId?: string, language?: string) {
    let headers = {};
    if (userId) {
      headers = { ...headers, userid: userId };
    }
    if (correlationId) {
      headers = { ...headers, correlationid: correlationId };
    }
    if (language) {
      headers = { ...headers, 'accept-language': language };
    }
    return HeadersUtil.createNewRequestHeaders(headers);
  }
}
