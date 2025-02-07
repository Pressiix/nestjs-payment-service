import {
  ACCEPT_LANGUAGE_HEADER,
  CORRELATION_ID_HEADER,
  DEFAULT_ACCEPT_LANGUAGE,
  USER_ID_HEADER,
} from '../../../src/configs/constants.config';
import { HeadersUtil } from '../../../src/utils/headers.util';

describe('HeadersUtil', () => {
  it('should create new request headers with default values', () => {
    const headers = HeadersUtil.createNewRequestHeaders({
      userid: 'user01',
    });
    expect(headers[ACCEPT_LANGUAGE_HEADER]).toStrictEqual(DEFAULT_ACCEPT_LANGUAGE);
    expect(headers[USER_ID_HEADER]).toStrictEqual('user01');
    expect(headers[CORRELATION_ID_HEADER]).not.toBeNull();
    expect(headers['requestTime']).not.toBeNull();
  });

  it('should create new request headers', () => {
    const headers = HeadersUtil.createNewRequestHeaders({
      userid: 'user01',
      'accept-language': 'en',
      correlationid: 'Correlation-ID',
    });
    expect(headers[ACCEPT_LANGUAGE_HEADER]).toStrictEqual('en');
    expect(headers[USER_ID_HEADER]).toStrictEqual('user01');
    expect(headers[CORRELATION_ID_HEADER]).toStrictEqual('Correlation-ID');
    expect(headers['requestTime']).not.toBeNull();
  });

  it('should build new request headers with default values', () => {
    const headers = HeadersUtil.buildRequestHeaders('user01');
    expect(headers[ACCEPT_LANGUAGE_HEADER]).toStrictEqual(DEFAULT_ACCEPT_LANGUAGE);
    expect(headers[USER_ID_HEADER]).toStrictEqual('user01');
    expect(headers[CORRELATION_ID_HEADER]).not.toBeNull();
    expect(headers['requestTime']).not.toBeNull();
  });

  it('should build new request headers', () => {
    const headers = HeadersUtil.buildRequestHeaders('user01', 'Correlation-ID', 'en');
    expect(headers[ACCEPT_LANGUAGE_HEADER]).toStrictEqual('en');
    expect(headers[USER_ID_HEADER]).toStrictEqual('user01');
    expect(headers[CORRELATION_ID_HEADER]).toStrictEqual('Correlation-ID');
    expect(headers['requestTime']).not.toBeNull();
  });

  it('should build new request headers with no userId', () => {
    const headers = HeadersUtil.buildRequestHeaders(undefined, 'Correlation-ID', 'en');
    expect(headers[ACCEPT_LANGUAGE_HEADER]).toStrictEqual('en');
    expect(headers[USER_ID_HEADER]).toBeUndefined();
    expect(headers[CORRELATION_ID_HEADER]).toStrictEqual('Correlation-ID');
    expect(headers['requestTime']).not.toBeNull();
  });
});
