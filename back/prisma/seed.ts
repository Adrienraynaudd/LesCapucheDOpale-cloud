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

  // Suppression des données existantes
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.equipmentStatus.deleteMany({});
  await prisma.status.deleteMany({});

  // Note: SQL Server utilise IDENTITY et non des séquences PostgreSQL
  // Les IDs seront auto-incrémentés automatiquement

  // Création des rôles
  await prisma.role.create({ data: { name: ROLES.ASSISTANT } });
  await prisma.role.create({ data: { name: ROLES.CLIENT } });

  // Création des statuts de quête
  await prisma.status.create({ data: { name: STATUSES.STATUS_WAITING } });
  await prisma.status.create({ data: { name: STATUSES.STATUS_VALIDATED } });
  await prisma.status.create({ data: { name: STATUSES.STATUS_FAILED } });
  await prisma.status.create({ data: { name: STATUSES.STATUS_STARTED } });
  await prisma.status.create({ data: { name: STATUSES.STATUS_CANCELLED } });
  await prisma.status.create({ data: { name: STATUSES.STATUS_REFUSED } });
  await prisma.status.create({ data: { name: STATUSES.STATUS_SUCCEEDED } });

  // Création des statuts d'équipement
  await prisma.equipmentStatus.create({ data: { name: EQUIPMENT_STATUSES.AVAILABLE } });
  await prisma.equipmentStatus.create({ data: { name: EQUIPMENT_STATUSES.BORROWED } });
  await prisma.equipmentStatus.create({ data: { name: EQUIPMENT_STATUSES.BROKEN } });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
