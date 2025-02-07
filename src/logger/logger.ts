import { CustomLogger } from './logger.service';

export class Logger extends CustomLogger {
  constructor(className: string, loggerService?: CustomLogger) {
    super();
    this.setClassName(className);

    if (loggerService) {
      this.setTraceId(loggerService.getTraceId());
      this.setIpAddress(loggerService.getIpAddress());
      this.setUserId(loggerService.getUserId());
      this.setRequestTime(loggerService.getRequestTime());
    }
  }
}

export { CustomLogger };
