import { Prisma } from '@prisma/client';

export type StatusDto = Prisma.StatusGetPayload<object>;
