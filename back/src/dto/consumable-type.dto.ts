import { IsString } from 'class-validator';

export class ConsumableTypeDto {
  @IsString()
  name: string;
}
