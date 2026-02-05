import {
  IsString,
  IsArray,
  IsInt,
  Min,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class CreateAdventurerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ValidateIf((o) => o.imageUrl !== '' && o.imageUrl !== null)
  @IsUrl()
  imageUrl?: string;

  @IsInt()
  @IsPositive()
  specialityId!: number;

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
