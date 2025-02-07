/* eslint-disable @typescript-eslint/no-var-requires */
import { DEFAULT_ACCEPT_LANGUAGE } from '../configs/constants.config';
import { ResponseStatus } from '../responses/response.status';

export class LookupUtil {
  static read(statusCode: number, language: string): JSON {
    if (!language) language = DEFAULT_ACCEPT_LANGUAGE;
    return require(__dirname + `/lookup/generic.response.status.json`)[language.toLocaleLowerCase()][statusCode];
  }

  static getLookup(statusCode: number, language: string): JSON | ResponseStatus {
    const responseStatus = this.read(statusCode, language);
    if (responseStatus) {
      return responseStatus;
    }

    return {
      code: statusCode,
      header: null,
      description: null,
    };
  }
}
