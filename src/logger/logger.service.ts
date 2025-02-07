import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

import { DateTime } from 'luxon';
import { replace } from '../logger/loggerPattern';

export interface LogRequest {
  method: string;
  uri: string;
  rawUri: string;
  reqHeader: object;
  reqBody: object;
  respStatus: number;
  respBody: object;
}

export type LogType = {
  url: string;
  trace_id: string;
  method: string;
  header: string;
  body: string;
};

export type LogOptionType = {
  functionName?: string;
};

export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Injectable()
export class CustomLogger implements NestLoggerService {
  private className = '-';
  private appName = '-';
  private traceId: string | string[] = '-';
  private ipAddress = '-';
  private userId = '-';
  private requestTime = Date.now();

  getTraceId() {
    return this.traceId;
  }

  getIpAddress() {
    return this.ipAddress;
  }

  getUserId() {
    return this.userId;
  }

  getAppName() {
    return this.appName;
  }

  getRequestTime() {
    return this.requestTime;
  }

  setClassName(className: string) {
    this.className = className;
  }

  setTraceId(traceId: string | string[]) {
    this.traceId = traceId;
  }

  setIpAddress(ipAddress: string) {
    this.ipAddress = ipAddress;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setAppName(appName: string) {
    this.appName = appName;
  }

  setRequestTime(requestTime: number) {
    this.requestTime = requestTime;
  }

  setHeaderRequest(request: any) {
    if (request.headers) {
      this.setTraceId(request.headers.traceId);
      this.setUserId(request.headers.userid);
      this.setRequestTime(parseInt(request.headers.requestTime, 10));
    }
    this.setIpAddress(request.ip);
  }

  public log(message: string, options?: LogOptionType) {
    this.printMessage(this.createApiLog(LogLevel.INFO, message, options));
  }

  public error(message: string, trace = '', options?: LogOptionType) {
    this.printMessage(this.createApiLog(LogLevel.ERROR, message, options));
    if (trace) {
      this.printMessage(this.createApiLog(LogLevel.ERROR, trace, options));
    }
  }

  public warn(message: string, options?: LogOptionType) {
    this.printMessage(this.createApiLog(LogLevel.WARN, message, options));
  }

  public debug(message: string, options?: LogOptionType) {
    this.printMessage(this.createApiLog(LogLevel.DEBUG, message, options));
  }

  public verbose(message: string, options?: LogOptionType) {
    this.printMessage(this.createApiLog(LogLevel.VERBOSE, message, options));
  }

  public logWithClassName(message: string, className: string) {
    this.setClassName(className);
    this.printMessage(this.createApiLog(LogLevel.INFO, message));
  }

  public errorWithClassName(message: string, trace = '', className: string) {
    this.setClassName(className);
    this.printMessage(this.createApiLog(LogLevel.ERROR, message));
    if (trace) {
      this.printMessage(this.createApiLog(LogLevel.ERROR, trace));
    }
  }

  public warnWithClassName(message: string, className: string) {
    this.setClassName(className);
    this.printMessage(this.createApiLog(LogLevel.WARN, message));
  }

  public debugWithClassName(message: string, className: string) {
    this.setClassName(className);
    this.printMessage(this.createApiLog(LogLevel.DEBUG, message));
  }

  public verboseWithClassName(message: string, className: string) {
    this.setClassName(className);
    this.printMessage(this.createApiLog(LogLevel.VERBOSE, message));
  }

  public request(req: LogRequest, execTime: number) {
    const logHeader = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      ipAddess: this.getIpAddress(),
      ...this.mapObjectWithConfig(this.defaultObject(req.reqHeader)),
    };

    const logBody = {
      execTime,
      reqBody: JSON.stringify(this.mapObjectWithConfig(this.defaultObject(req.reqBody))),
      respBoy: JSON.stringify(this.mapObjectWithConfig(this.defaultObject(req.respBody))),
    };

    const log: LogType = {
      url: req.rawUri,
      trace_id: this.getTraceId() as string,
      method: req.method,
      header: JSON.stringify(logHeader),
      body: JSON.stringify(logBody),
    };
    const parsedHeader = JSON.parse(log.header);
    const parsedBody = JSON.parse(log.body);

    const parsedLog = {
      ...log,
      header: parsedHeader,
      body: parsedBody,
    };
    this.printMessage(JSON.stringify(parsedLog, null, 2));
  }

  public audit(eventCode: string, subEventCode: string, data: { [key: string]: any } = {}) {
    const logBody = {
      // ...this.createPrefixFormat('info', 'AuditLog'),
      EVENT_CODE: this.defaultTxt(eventCode),
      SUB_EVENT_CODE: this.defaultTxt(subEventCode),
      message: JSON.stringify(this.mapObjectWithConfig(this.defaultObject(data))),
    };

    const logHeader = {
      timestamp: new Date(),
      level: LogLevel.INFO,
    };

    const log: LogType = {
      url: '',
      trace_id: '',
      method: '',
      header: JSON.stringify(logHeader),
      body: JSON.stringify(logBody),
    };

    this.printMessage(JSON.stringify(log));
  }

  private createApiLog(logLevel: string, message: any, options?: LogOptionType) {
    const { functionName } = options || {};
    const logBody = {
      className: this.defaultTxt(this.className),
      functionName: this.defaultTxt(functionName),
      message: this.defaultTxt(message),
    };

    const logHeader = {
      timestamp: new Date(),
      level: logLevel,
    };

    const log: LogType = {
      url: '',
      trace_id: '',
      method: '',
      header: JSON.stringify(logHeader),
      body: JSON.stringify(logBody),
    };

    this.printMessage(JSON.stringify(log));
  }

  private createPrefixFormat(logLevel: string, logType: any) {
    // disable hard to investigate log in cloudwatch
    const timestamp = DateTime.now().toFormat('dd/MM/yyyy HH:mm:ss.SSS');
    const appName = this.appName;
    const ipAddress = this.ipAddress;
    const traceId = this.traceId;
    const userId = this.userId;

    return {
      timestamp,
      logType,
      logLevel,
      ipAddress,
      appName,
      traceId,
      userId,
    };
  }

  private printMessage(message: any) {
    if (message) {
      process.stdout.write(message);
      process.stdout.write('\n');
    }
  }

  private defaultTxt(txt: string) {
    return txt || '-';
  }

  private defaultObject(obj: any) {
    return obj || {};
  }

  private mapObjectWithConfig(obj: any) {
    let originalObj = obj;
    if (typeof originalObj === 'string') {
      try {
        originalObj = JSON.parse(originalObj);
      } catch (err) {
        return obj;
      }
    }

    const newObj: { [key: string]: any } = {};
    Object.entries(obj).forEach(([key, value]) => (newObj[key] = replace(key, value)));

    return newObj;
  }
}
