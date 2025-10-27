import { IsString, IsArray, IsInt, Min, IsNotEmpty, IsPositive, IsOptional } from 'class-validator';

export class CreateAdventurerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsPositive()
    specialtyId!: number;

    @IsInt()
    @Min(0)
    dailyRate: number;

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