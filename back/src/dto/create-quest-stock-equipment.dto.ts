import { IsInt } from 'class-validator';

export class CreateQuestStockEquipmentDto {
  @IsInt()
  questId: number;

  @IsInt()
  equipmentStockId: number;
}
