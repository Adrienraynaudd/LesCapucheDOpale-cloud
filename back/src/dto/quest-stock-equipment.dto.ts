import { Prisma } from '@prisma/client';

export type QuestStockEquipmentDto = Prisma.QuestStockEquipmentGetPayload<{
  include: { equipmentStock: true; quest: true };
}>;
