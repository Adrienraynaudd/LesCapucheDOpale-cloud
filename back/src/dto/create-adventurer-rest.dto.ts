import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RestType {
  REST = 'rest',
  UNAVAILABLE = 'unavailable',
  MISSION_REST = 'mission_rest',
}

export class CreateAdventurerRestDto {
  @ApiProperty({ example: 1, description: 'Adventurer ID' })
  @IsInt()
  adventurerId: number;

  @ApiProperty({
    example: '2026-02-05T00:00:00.000Z',
    description: 'Start date of the rest period',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-02-10T00:00:00.000Z',
    description: 'End date of the rest period',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 'Repos après mission',
    description: 'Reason for the rest',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    enum: RestType,
    example: 'rest',
    description: 'Type of rest: rest, unavailable, or mission_rest',
  })
  @IsEnum(RestType)
  type: RestType;
}
