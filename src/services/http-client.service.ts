import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { IncomingHttpHeaders } from 'http';
import { firstValueFrom, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import TechnicalException from '../exceptions/TechnicalException';
import { ResponseModel } from '../responses/response.model';
import { HeadersUtil } from '../utils/headers.util';

@Injectable()
export class HttpClient {
  private readonly logger = new Logger(HttpClient.name);

  constructor(private readonly httpService: HttpService) {}

  public async post<T = any>(headers: IncomingHttpHeaders, url: string, body: any) {
    this.logger.log(`HTTP request ${url}> ${JSON.stringify(body)}`);
    const caller = this.httpService.post<ResponseModel<T>>(url, body, {
      headers: HeadersUtil.createNewRequestHeaders(headers),
    });
    return this.handleHttp<ResponseModel<T>>(caller);
  }

  public async get<T = any>(headers: IncomingHttpHeaders, url: string) {
    const caller = this.httpService.get<ResponseModel<T>>(url, {
      headers: HeadersUtil.createNewRequestHeaders(headers),
    });
    return this.handleHttp<ResponseModel<T>>(caller);
  }

  public async put<T = any>(headers: IncomingHttpHeaders, url: string, body: any) {
    const caller = this.httpService.put<ResponseModel<T>>(url, body, {
      headers: HeadersUtil.createNewRequestHeaders(headers),
    });
    return this.handleHttp<ResponseModel<T>>(caller);
  }

  private async handleHttp<T>(caller: Observable<AxiosResponse<T>>) {
    const reactive = caller.pipe(
      tap((response) => {
        const statusCode = response.status;
        if (statusCode !== 200) throw new TechnicalException('HTTP status is not 200');

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const dataStatusCode = response.data?.statusCode;
        if (dataStatusCode) throw new TechnicalException(`Error with status ${dataStatusCode}`);
      }),
      map((response) => response.data),
    );

    return firstValueFrom(reactive);
  }
}
