import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class UpdateAdventurerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateIf((o) => o.imageUrl !== '' && o.imageUrl !== null)
  @IsUrl()
  imageUrl?: string | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  dailyRate?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  specialityId?: number;

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
