import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { ApplicationModule } from './app.module';
import { SERVER_PORT } from './configs/constants.config';
import { ValidationException } from './exceptions/validation.exception';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HttpHeaderInterceptor } from './interceptors/http.header.interceptor';
import { LoggerInterceptor } from './middleware/logger.interceptor';

async function bootstrap() {
  // Metric Configuration
  const app = await NestFactory.create<NestFastifyApplication>(ApplicationModule);

  app.enableShutdownHooks();
  app.useGlobalInterceptors(new HttpHeaderInterceptor(), new LoggerInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new ValidationException(errors);
      },
    }),
  );

  // app.use(LoggerMiddleware);
  app.useLogger(new Logger('Nest'));
  app.enableCors();
  app.use(helmet());
  await app.listen(SERVER_PORT, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
