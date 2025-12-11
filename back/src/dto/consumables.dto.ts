import { IsString } from 'class-validator';

export class ConsumableDto {
  @IsString()
  name: string;
  consumableTypeId: number;
  quantity: number;
  cost: number;
}
