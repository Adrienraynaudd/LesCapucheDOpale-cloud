import { Prisma } from '@prisma/client';

export const equipmentStockInclude =
  Prisma.validator<Prisma.EquipmentStockInclude>()({
    equipment: { include: { equipmentType: true } },
  });

export type EquipmentStockDto = Prisma.EquipmentStockGetPayload<{
  include: typeof equipmentStockInclude;
}>;
