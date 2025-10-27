import { IsString } from 'class-validator';

export class UpdateEquipmentTypeDto {
    @IsString()
    name?: string;
}
