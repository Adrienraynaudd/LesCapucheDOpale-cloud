import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdventurerAvailabilityQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Adventurer ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  adventurerId?: number;

  @ApiPropertyOptional({
    example: '2026-02-01T00:00:00.000Z',
    description: 'Start of the period to check',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-28T00:00:00.000Z',
    description: 'End of the period to check',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
