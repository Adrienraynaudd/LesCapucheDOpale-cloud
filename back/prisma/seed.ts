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

  // Vérifier et forcer les rôles avec IDs 1 et 2
  const role1 = await prisma.role.findFirst({ where: { id: 1 } });
  const role2 = await prisma.role.findFirst({ where: { id: 2 } });

  if (!role1 || !role2 || role1.name !== ROLES.ASSISTANT || role2.name !== ROLES.CLIENT) {
    console.log('🔄 Réinitialisation des rôles avec IDs 1 et 2...');
    
    // Supprimer les users et rôles existants pour pouvoir recréer
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    
    // Réinitialiser le compteur IDENTITY et forcer les IDs
    await prisma.$executeRawUnsafe(`DBCC CHECKIDENT ('Role', RESEED, 0)`);
    await prisma.$executeRawUnsafe(`SET IDENTITY_INSERT [Role] ON`);
    await prisma.$executeRawUnsafe(`INSERT INTO [Role] (id, name) VALUES (1, '${ROLES.ASSISTANT}')`);
    await prisma.$executeRawUnsafe(`INSERT INTO [Role] (id, name) VALUES (2, '${ROLES.CLIENT}')`);
    await prisma.$executeRawUnsafe(`SET IDENTITY_INSERT [Role] OFF`);
    
    console.log('✅ Rôles créés: assistant (ID=1), client (ID=2)');
  } else {
    console.log('✅ Rôles déjà corrects: assistant (ID=1), client (ID=2)');
  }

  // Création des statuts de quête (upsert par nom unique)
  for (const statusName of Object.values(STATUSES)) {
    await prisma.status.upsert({
      where: { name: statusName },
      update: {},
      create: { name: statusName },
    });
  }

  // Création des statuts d'équipement (upsert par nom unique)
  for (const statusName of Object.values(EQUIPMENT_STATUSES)) {
    await prisma.equipmentStatus.upsert({
      where: { name: statusName },
      update: {},
      create: { name: statusName },
    });
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
