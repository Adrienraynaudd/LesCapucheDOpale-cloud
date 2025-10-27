import { Prisma } from '@prisma/client';

export const adventurerInclude = Prisma.validator<Prisma.AdventurerInclude>()({
    specialty: true,
    equipmentTypes: true,
    consumableTypes: true,
});

export type AdventurerDto = Prisma.AdventurerGetPayload<{
    include: typeof adventurerInclude;
}>;