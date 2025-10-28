import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Date)
  @IsDate()
  finalDate: Date;

  @IsInt()
  @Min(0)
  reward: number;

  @IsInt()
  @IsPositive()
  estimatedDuration: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  adventurerIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  equipmentStockIds?: number[];
}
