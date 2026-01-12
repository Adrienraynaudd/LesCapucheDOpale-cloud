import { IsInt } from 'class-validator';

export class CreateEquipmentStockDto {
  @IsInt()
  equipmentId: number;
}
