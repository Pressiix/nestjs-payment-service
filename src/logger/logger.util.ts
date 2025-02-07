import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { Logger } from './logger';

export const createLogAppRequest = (httpArg: HttpArgumentsHost, respBody: any) => {
  const req = httpArg.getRequest<Request>();
  const res = httpArg.getResponse<Response>();

  return {
    method: req.method || '-',
    uri: req.path || '-',
    rawUri: `${req.hostname}${req.path}` || '-',
    reqHeader: req.headers || {},
    reqBody: req.body || {},
    respStatus: res.statusCode,
    respBody: respBody || {},
  };
};

export const addReqTimeHeaderRequest = (request: AxiosRequestConfig, correlationid?: string | string[]) => {
  request.headers.correlationid = correlationid || request.headers.correlationid || uuidv4();
  request.headers.requestTime = Date.now();

  return request;
};

export const createLogHttpClientRequest = (response: AxiosResponse) => {
  const url = response.config.url || '-';
  let method = '-';
  if (response.config.method) {
    method = response.config.method.toUpperCase();
  }

  return {
    req: {
      method,
      uri: url,
      rawUri: url,
      reqHeader: response.config.headers,
      reqBody: response.config.data,
      respStatus: response.status || 404,
      respBody: response.data,
    },
    reqTime: response.config.headers.requestTime,
  };
};

export const logSqsSender = (queueUrl: string, message: any, startExecTime?: number): void => {
  const log = new Logger('');
  const splitQueueUrl = queueUrl ? queueUrl.split('/') : null;
  const queue: string = splitQueueUrl && splitQueueUrl.length > 0 ? (splitQueueUrl.pop() as string) : '-';
  log.request(
    {
      method: 'OUTGOING',
      uri: queue,
      rawUri: queue,
      reqHeader: {},
      reqBody: message,
      respStatus: 200,
      respBody: {},
    },
    startExecTime ? startExecTime : Date.now(),
  );
};

export const logSqsConsumer = (queueUrl: string, message: any, startExecTime?: number): void => {
  const log = new Logger('');
  const splitQueueUrl = queueUrl ? queueUrl.split('/') : null;
  const queue = splitQueueUrl && splitQueueUrl.length > 0 ? (splitQueueUrl.pop() as string) : '-';
  log.request(
    {
      method: 'INCOMING',
      uri: queue,
      rawUri: queue,
      reqHeader: {},
      reqBody: message,
      respStatus: 200,
      respBody: {},
    },
    startExecTime ? startExecTime : Date.now(),
  );
};
