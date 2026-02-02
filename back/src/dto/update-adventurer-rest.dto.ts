import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RestType } from './create-adventurer-rest.dto';

export class UpdateAdventurerRestDto {
  @ApiPropertyOptional({
    example: '2026-02-05T00:00:00.000Z',
    description: 'Start date of the rest period',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-10T00:00:00.000Z',
    description: 'End date of the rest period',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'Repos après mission',
    description: 'Reason for the rest',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    enum: RestType,
    example: 'rest',
    description: 'Type of rest: rest, unavailable, or mission_rest',
  })
  @IsOptional()
  @IsEnum(RestType)
  type?: RestType;
}
