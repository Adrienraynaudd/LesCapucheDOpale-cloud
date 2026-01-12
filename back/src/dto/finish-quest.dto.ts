import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class FinishQuestDto {
  @ApiProperty({
    description: 'Indique si la quête est un succès',
    example: true,
  })
  @IsBoolean()
  isSuccess: boolean;
}
