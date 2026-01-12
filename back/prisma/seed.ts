import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROLES = {
  ASSISTANT: 'assistant',
  CLIENT: 'client',
};

const STATUSES = {
    STATUS_WAITING: 'En attente de validation',
    STATUS_VALIDATED: 'Validée',
    STATUS_STARTED: 'Commencée',
    STATUS_REFUSED: 'Refusée',
    STATUS_CANCELLED: 'Abandonnée',
    STATUS_SUCCEEDED: 'Terminée',
    STATUS_FAILED: 'Échouée',
};

const EQUIPMENT_STATUSES = {
  AVAILABLE: 'Disponible',
  BORROWED: 'Emprunté',
  BROKEN: 'Cassé',
};

async function main() {

  await prisma.equipmentStatus.deleteMany({});
  await prisma.status.deleteMany({});
  await prisma.role.deleteMany({});


  await Promise.all([
    prisma.role.create({ data: { name: ROLES.ASSISTANT } }),
    prisma.role.create({ data: { name: ROLES.CLIENT } }),
  ]);

  await Promise.all([
    prisma.status.create({ data: { name: STATUSES.STATUS_WAITING } }),
    prisma.status.create({ data: { name: STATUSES.STATUS_VALIDATED } }),
    prisma.status.create({ data: { name: STATUSES.STATUS_STARTED } }),
    prisma.status.create({ data: { name: STATUSES.STATUS_REFUSED } }),
    prisma.status.create({ data: { name: STATUSES.STATUS_CANCELLED } }),
    prisma.status.create({ data: { name: STATUSES.STATUS_SUCCEEDED } }),
    prisma.status.create({ data: { name: STATUSES.STATUS_FAILED } }),
  ]);


  await Promise.all([
    prisma.equipmentStatus.create({ data: { name: EQUIPMENT_STATUSES.AVAILABLE } }),
    prisma.equipmentStatus.create({ data: { name: EQUIPMENT_STATUSES.BORROWED } }),
    prisma.equipmentStatus.create({ data: { name: EQUIPMENT_STATUSES.BROKEN } }),
  ]);


}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
