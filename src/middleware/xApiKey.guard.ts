import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';

@Injectable()
export class XApiKeyStrategy extends PassportStrategy(Strategy, 'x-api-key') {
  constructor(private readonly configService: ConfigService) {
    super({ header: 'X-API-KEY' }, true, async (apiKey: string, done: (error: Error, data: any) => void) => {
      return this.validate(apiKey, done);
    });
  }

  public validate = (apiKey: string, done: (error: Error, data: any) => void) => {
    if (this.configService.get<string>('X_API_KEY') === apiKey) {
      done(null, true);
    }
    done(new UnauthorizedException({ data: 'Unauthorized' }), null);
  };
}
