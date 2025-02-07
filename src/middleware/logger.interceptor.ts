import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { CustomLogger } from '../logger/logger';
import { createLogAppRequest } from '../logger/logger.util';

@Injectable({ scope: Scope.REQUEST })
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new CustomLogger();

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Http context
    const http = context.switchToHttp();

    // Request context
    const req = http.getRequest();

    // Get trace id from headers context
    const traceId = req.headers['trace-id'] || '-';

    // Get ip address
    const ipAddress = req.socket.remoteAddress;

    // Get app name
    const appName = req.headers['x-app-id'];
    const preferredUsername = req.headers['preferredUsername'] || '-';
    const startTime = Date.now();

    try {
      // Set user id
      this.logger.setUserId(preferredUsername);
    } catch (err) {}

    // Set trace id
    this.logger.setTraceId(traceId);

    // Set ip address
    this.logger.setIpAddress(ipAddress);

    // Set app name
    this.logger.setAppName(appName);

    return next.handle().pipe(
      tap((resBody) => {
        const execTime = Date.now() - startTime;
        const httpArgumentsHost: HttpArgumentsHost = context.switchToHttp();
        if (!httpArgumentsHost.getRequest().url.includes('health')) {
          this.logger.request(createLogAppRequest(httpArgumentsHost, resBody), execTime);
        }
      }),
      catchError((err) => {
        const execTime = Date.now() - startTime;
        const httpArgumentsHost: HttpArgumentsHost = context.switchToHttp();
        this.logger.request(createLogAppRequest(httpArgumentsHost, err), execTime);
        return throwError(() => err);
      }),
    );
  }
}
