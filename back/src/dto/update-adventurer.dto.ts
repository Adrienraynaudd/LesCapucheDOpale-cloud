import { IsArray, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAdventurerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    dailyRate?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    specialtyId?: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    equipmentTypeIds?: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    consumableTypeIds?: number[];
}
