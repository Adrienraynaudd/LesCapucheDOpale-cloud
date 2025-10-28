import { IsString } from 'class-validator';

export class EquipmentTypeDto {
  @IsString()
  name: string;
}
