import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HttpClient } from '../services/http-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [HttpClient],
  exports: [HttpClient],
})
export class HttpClientModule {}
