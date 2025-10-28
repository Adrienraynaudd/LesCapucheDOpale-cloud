import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  cost: number;

  @IsInt()
  @Min(0)
  maxDurability: number;

  @IsInt()
  equipmentTypeId: number;
}
