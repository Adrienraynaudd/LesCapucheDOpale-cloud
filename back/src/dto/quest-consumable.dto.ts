import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

export class QuestConsumableItemDto {
  @ApiProperty({ example: 1, description: 'ID du consommable' })
  @IsInt()
  @IsPositive()
  consumableId: number;

  @ApiProperty({ example: 5, description: 'Quantité à ajouter/retirer' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class QuestConsumablesDto {
  @ApiProperty({
    type: [QuestConsumableItemDto],
    description: 'Liste des consommables avec leurs quantités',
    example: [
      { consumableId: 1, quantity: 5 },
      { consumableId: 2, quantity: 3 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestConsumableItemDto)
  consumables: QuestConsumableItemDto[];
}
