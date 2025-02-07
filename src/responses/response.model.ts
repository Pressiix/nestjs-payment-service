import { ResponseStatus } from './response.status';

export class ResponseModel<T> {
  status: ResponseStatus;
  data: T;

  constructor(status: ResponseStatus, data: T) {
    this.status = status;
    this.data = data;
  }
}
