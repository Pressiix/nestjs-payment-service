import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './configs';
import { postgresDbConfig } from './configs/postgres.database.config';
import { AppController } from './controllers/app.controller';
import { XApiKeyStrategy } from './middleware/xApiKey.guard';
import { CommonModule } from './modules/common.module';
import { HealthCheckModule } from './modules/healthCheck.module';
import { SystemManagementModule } from './modules/system.module';
import { AppService } from './services/app.service';
import { SqsService } from './services/sqs.service';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { CallbackController } from './controllers/callback.controller';
import { CallbackService } from './services/callback.service';
import { TransactionLog } from './entities/transaction-log.entity';
import { OmiseService } from './services/omise.service';
import { DirectusService } from './services/directus.service';
import { TransactionStatus } from './entities/transaction-status.entity';
import { ServiceTokenEnum } from './enums/service-token.enum';
import { NotificationService } from './services/notification.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('postgres'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TransactionLog, TransactionStatus]),
    CommonModule,
    HealthCheckModule.register(postgresDbConfig()),
    SystemManagementModule.register(postgresDbConfig()),
  ],

  controllers: [AppController, PaymentController, CallbackController],
  providers: [
    AppService,
    XApiKeyStrategy,
    {
      provide: ServiceTokenEnum.SQS,
      useClass: SqsService,
    },
    {
      provide: ServiceTokenEnum.PAYMENT_LOGGER,
      useValue: new Logger('Payment Service'),
    },
    {
      provide: ServiceTokenEnum.OMISE,
      useClass: OmiseService,
    },
    {
      provide: ServiceTokenEnum.DIRECTUS,
      useClass: DirectusService,
    },
    {
      provide: ServiceTokenEnum.NOTIFICATION,
      useClass: NotificationService,
    },
    PaymentService,
    CallbackService,
  ],
})
export class ApplicationModule implements OnApplicationShutdown {
  private readonly logger = new Logger(ApplicationModule.name);
  onApplicationShutdown(signal: string) {
    this.logger.log(signal);
  }
}
