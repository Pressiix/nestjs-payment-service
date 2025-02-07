import { Injectable } from '@nestjs/common';
import { HelloRequest } from '../models/request/hello.request';
import { HelloResponse } from '../models/response/hello.response';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): object {
    return { status: 'UP' };
  }

  async postHello(request: HelloRequest, headers: any): Promise<HelloResponse> {
    return {
      message: request.message,
    };
  }
}
