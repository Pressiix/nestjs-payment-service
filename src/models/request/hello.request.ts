import { IsNotEmpty } from 'class-validator';

export class HelloRequest {
  @IsNotEmpty()
  message: string;
}
