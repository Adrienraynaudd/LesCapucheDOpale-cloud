import { IsString } from 'class-validator';

export class UpdateConsumableTypeDto {
  @IsString()
  name?: string;
}
