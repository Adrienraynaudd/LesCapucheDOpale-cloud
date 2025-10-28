import { IsInt, Min } from 'class-validator';

export class CreateEquipmentStockDto {
  @IsInt()
  equipmentId: number;

  @IsInt()
  @Min(0)
  durability: number;
}
