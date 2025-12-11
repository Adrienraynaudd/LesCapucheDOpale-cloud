import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class ValidateQuestDto {
  @ApiProperty({ example: 150, description: 'XP recommandé pour la quête' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  xp: number;
}
