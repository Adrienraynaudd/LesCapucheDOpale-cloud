import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsPositive } from 'class-validator';

export class FinishQuestDto {
  @ApiProperty({
    description: 'Indique si la quête est un succès',
    example: true,
  })
  @IsBoolean()
  isSuccess: boolean;

  @ApiProperty({
    description: 'Durée réelle de la quête en jours',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  duration: number;
}
