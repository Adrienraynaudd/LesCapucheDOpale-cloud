import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateConsumableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsPositive()
  consumableTypeId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  cost: number;
}
