import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateConsumableDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPositive()
  consumableTypeId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsInt()
  cost?: number;
}
