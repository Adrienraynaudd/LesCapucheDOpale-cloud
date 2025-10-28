import { Prisma } from '@prisma/client';

export const equipmentInclude = Prisma.validator<Prisma.EquipmentInclude>()({
  equipmentType: true,
});

export type EquipmentDto = Prisma.EquipmentGetPayload<{
  include: typeof equipmentInclude;
}>;
