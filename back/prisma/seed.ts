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
  // Seed portable PostgreSQL/SQL Server: upsert roles with deterministic IDs.
  await prisma.role.upsert({
    where: { id: 1 },
    update: { name: ROLES.ASSISTANT },
    create: { id: 1, name: ROLES.ASSISTANT },
  });

  await prisma.role.upsert({
    where: { id: 2 },
    update: { name: ROLES.CLIENT },
    create: { id: 2, name: ROLES.CLIENT },
  });

  console.log('✅ Rôles seedés: assistant (ID=1), client (ID=2)');

  // Création des statuts de quête (créer si n'existe pas)
  for (const statusName of Object.values(STATUSES)) {
    const existing = await prisma.status.findFirst({ where: { name: statusName } });
    if (!existing) {
      await prisma.status.create({ data: { name: statusName } });
    }
  }

  // Création des statuts d'équipement (créer si n'existe pas)
  for (const statusName of Object.values(EQUIPMENT_STATUSES)) {
    const existing = await prisma.equipmentStatus.findFirst({ where: { name: statusName } });
    if (!existing) {
      await prisma.equipmentStatus.create({ data: { name: statusName } });
    }
  }

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
