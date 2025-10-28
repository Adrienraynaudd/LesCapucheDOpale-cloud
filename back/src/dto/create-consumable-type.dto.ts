import { IsString } from 'class-validator';

export class CreateConsumableTypeDto {
  @IsString()
  name: string;
}
