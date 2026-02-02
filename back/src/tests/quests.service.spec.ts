import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuestsService } from '../services/quests.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Prisma } from '@prisma/client';

type JestMock = any;

// Helper function to create a mock Prisma error without throwing
function createPrismaError(message: string, code: string): Error {
  const error = new Error(message) as any;
  error.code = code;
  error.clientVersion = '1.0';
  error.name = 'PrismaClientKnownRequestError';
  return error;
}

type MockedPrismaService = Partial<{
  status: { findFirst: JestMock; findUnique: JestMock };
  adventurer: { findMany: JestMock; updateMany: JestMock; update: JestMock };
  equipmentStock: { findMany: JestMock; update: JestMock; updateMany: JestMock };
  questStockEquipment: { findMany: JestMock; createMany: JestMock; deleteMany: JestMock };
  quest: { create: JestMock; update: JestMock; findMany: JestMock; findUnique: JestMock };
  user: { findUnique: JestMock };
  transaction: { findFirst: JestMock; create: JestMock };
  consumable: { findMany: JestMock };
  questConsumable: { findMany: JestMock; createMany: JestMock; deleteMany: JestMock; update: JestMock; delete: JestMock; upsert: JestMock };
  adventurerRest: { findMany: JestMock; create: JestMock; deleteMany: JestMock };
  $transaction: JestMock;
}>;

describe('QuestsService', () => {
  let service: QuestsService;

  const mockPrisma: MockedPrismaService = {
    status: { findFirst: jest.fn(), findUnique: jest.fn() },
    adventurer: { findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    equipmentStock: { findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    questStockEquipment: { findMany: jest.fn(), createMany: jest.fn(), deleteMany: jest.fn() },
    quest: { create: jest.fn(), update: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    transaction: { findFirst: jest.fn(), create: jest.fn() },
    consumable: { findMany: jest.fn() },
    questConsumable: { findMany: jest.fn(), createMany: jest.fn(), deleteMany: jest.fn(), update: jest.fn(), delete: jest.fn(), upsert: jest.fn() },
    adventurerRest: { findMany: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user!.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.status!.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.adventurerRest!.findMany.mockResolvedValue([]);
    service = new QuestsService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a quest with STATUS_ID_WAITING', async () => {
      const dto: CreateQuestDto = {
        name: 'Q1', description: 'desc', finalDate: new Date(), reward: 100, estimatedDuration: 3,
        adventurerIds: [1, 2], equipmentStockIds: [10, 11],
      };
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockPrisma.quest!.create.mockResolvedValue({ id: 99, ...dto });

      const res = await service.create(42, dto);
      expect(res).toEqual(expect.objectContaining({ id: 99 }));
    });

    it('should create a quest without adventurers and equipment', async () => {
      const dto: CreateQuestDto = { 
        name: 'Q2', 
        reward: 50, 
        estimatedDuration: 1,
        description: 'Auto description',
        finalDate: new Date()
      };
      
      mockPrisma.quest!.create.mockResolvedValue({ id: 100 });

      const res = await service.create(42, dto);
      expect(res).toEqual(expect.objectContaining({ id: 100 }));
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user!.findUnique.mockResolvedValue(null);
      const dto: CreateQuestDto = { name: 'Q', reward: 50, estimatedDuration: 1, description: 'd', finalDate: new Date() };
      await expect(service.create(999, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if status does not exist', async () => {
      mockPrisma.status!.findUnique.mockResolvedValue(null);
      const dto: CreateQuestDto = { name: 'Q', reward: 50, estimatedDuration: 1, description: 'd', finalDate: new Date() };
      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if adventurer id missing', async () => {
      const dto: Partial<CreateQuestDto> = { name: 'Q3', adventurerIds: [1, 2] };
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 1 }]);
      await expect(service.create(1, dto as CreateQuestDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(1, dto as CreateQuestDto)).rejects.toThrow(/Adventurer id\(s\) not found/);
    });

    it('should throw NotFoundException if equipmentStock id missing', async () => {
      const dto: Partial<CreateQuestDto> = { name: 'Q4', equipmentStockIds: [10, 11] };
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10 }]);
      
      await expect(service.create(1, dto as CreateQuestDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockPrisma.quest!.findUnique.mockResolvedValue({ statusId: 1 }); // STATUS_ID_WAITING = 1
    });

    it('should update quest and set adventurers and questStockEquipments when arrays provided', async () => {
      const dto: Partial<UpdateQuestDto> = { name: 'Updated', adventurerIds: [3, 4], equipmentStockIds: [20] };
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 3 }, { id: 4 }]) 
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 20 }]);
      mockPrisma.quest!.update.mockResolvedValue({ id: 7 });

      const res = await service.update(7, dto as UpdateQuestDto);
      expect(mockPrisma.quest!.update).toHaveBeenCalled();
      expect(res).toEqual({ id: 7 });
    });

    it('should throw NotFoundException if Prisma throws P2025 during update', async () => {
      const prismaError = createPrismaError('Record not found', 'P2025');
      
      mockPrisma.quest!.update.mockRejectedValueOnce(prismaError);

      await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors during update', async () => {
      const error = new Error('Database went boom');
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.update(1, { name: 'Boom' })).rejects.toThrow(error);
    });
  });

  it('should return quests with relations', async () => {
    const quests = [{ id: 1, name: 'Quest1' }];
    mockPrisma.quest!.findMany.mockResolvedValue(quests);
    const res = await service.findAll();
    expect(res).toBe(quests);
  });

  it('should handle adventurers with null experience (coverage for ?? 0)', async () => {
    const quests = [
      { 
        id: 1, 
        adventurers: [
          { experience: null }, 
          { experience: 10 }
        ] 
      },
    ];
    mockPrisma.quest!.findMany.mockResolvedValue(quests as any);
    
    const res = await service.findAll({ avgXpMin: 0 });
    
    // (0 + 10) / 2 = 5
    expect((res as any)[0].avgExperience).toBe(5);
  });

  it('should return quest by id', async () => {
    const quest = { id: 1, name: 'Quest1' };
    mockPrisma.quest!.findUnique.mockResolvedValue(quest);
    const res = await service.findOne(1);
    expect(res).toBe(quest);
  });

  it('should throw NotFoundException if quest not found', async () => {
    mockPrisma.quest!.findUnique.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  describe('updateStatus', () => {
    it('should update quest status by id', async () => {
      const quest = { id: 1, statusId: 2 };
      mockPrisma.quest!.update.mockResolvedValue(quest);
      const res = await service.updateStatus(1, { statusId: 2 });
      expect(res).toBe(quest);
    });

    it('should throw BadRequestException if no statusId provided', async () => {
      await expect(service.updateStatus(1, {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if Prisma throws P2025 during status update', async () => {
      const prismaError = createPrismaError('Not found', 'P2025');
      
      mockPrisma.quest!.update.mockRejectedValueOnce(prismaError);

      await expect(service.updateStatus(999, { statusId: 2 })).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors during status update', async () => {
      const error = new Error('Generic');
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.updateStatus(1, { statusId: 2 })).rejects.toThrow(error);
    });
  });

  // ------------------------ ADVENTURER HELPERS ------------------------
  describe('adventurer helpers', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockPrisma.quest!.update.mockResolvedValue({ id: 1 });
      mockPrisma.quest!.findUnique.mockResolvedValue({ statusId: 1 }); // STATUS_ID_WAITING = 1
      mockPrisma.user!.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.status!.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.adventurerRest!.findMany.mockResolvedValue([]);
    });

    it('should attach adventurers', async () => {
      mockPrisma.adventurer!.findMany.mockReset();
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
        .mockResolvedValueOnce([]);
      const res = await service.attachAdventurers(1, [1, 2]);
      expect(res).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if Prisma throws P2025 during attach', async () => {
      const prismaError = createPrismaError('Not found', 'P2025');
      
      mockPrisma.adventurer!.findMany.mockReset();
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([]);
      mockPrisma.quest!.update.mockRejectedValueOnce(prismaError);
      await expect(service.attachAdventurers(999, [1])).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors during attach', async () => {
      const error = new Error('Fail');
      mockPrisma.adventurer!.findMany.mockReset();
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([]);
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.attachAdventurers(1, [1])).rejects.toThrow(error);
    });

    it('should detach adventurers', async () => {
      mockPrisma.adventurer!.findMany.mockReset();
      mockPrisma.adventurer!.findMany.mockResolvedValueOnce([{ id: 1 }]);
      const res = await service.detachAdventurers(1, [1]);
      expect(res).toEqual({ id: 1 });
    });

    it('should set adventurers', async () => {
      mockPrisma.adventurer!.findMany.mockReset();
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([]);
      const res = await service.setAdventurers(1, [1]);
      expect(res).toEqual({ id: 1 });
    });
  });

  // ------------------------ EQUIPMENT STOCK HELPERS ------------------------
  describe('equipmentStock helpers', () => {
    beforeEach(() => {
      mockPrisma.questStockEquipment!.findMany.mockResolvedValue([]);
      mockPrisma.questStockEquipment!.createMany.mockResolvedValue({});
      mockPrisma.questStockEquipment!.deleteMany.mockResolvedValue({});
      mockPrisma.$transaction.mockResolvedValue({});
      mockPrisma.quest!.findUnique.mockResolvedValue({ id: 1, statusId: 1 }); // STATUS_ID_WAITING = 1
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10, durability: 10, equipment: { name: 'Épée' } }]);
    });

    it('should attach equipment stocks', async () => {
      const res = await service.attachEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should throw BadRequestException when attaching equipment with durability <= 0', async () => {
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10, durability: 0, equipment: { name: 'Épée cassée' } }]);
      await expect(service.attachEquipmentStocks(1, [10])).rejects.toThrow(BadRequestException);
    });

    it('should detach equipment stocks', async () => {
      const res = await service.detachEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should set equipment stocks', async () => {
      const res = await service.setEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should throw BadRequestException when setting equipment with durability <= 0', async () => {
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10, durability: 0, equipment: { name: 'Bouclier cassé' } }]);
      await expect(service.setEquipmentStocks(1, [10])).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------ BUSINESS ACTIONS ------------------------
  describe('business actions: refuse/abandon', () => {
    describe('refuseQuest', () => {
      it('should set status "refusée" when current status is waiting', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1 }); // STATUS_ID_WAITING = 1
        mockPrisma.quest!.update.mockResolvedValueOnce({ id: 1, status: { name: 'refusée' } });

        const res = await service.refuseQuest(1);
        expect(res).toEqual(expect.objectContaining({ status: expect.objectContaining({ name: 'refusée' }) }));
      });

      it('should fail with BadRequestException when current status is "validée"', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 2 }); // STATUS_ID_VALIDATED = 2
        await expect(service.refuseQuest(1)).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException when quest does not exist', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce(null as any);
        await expect(service.refuseQuest(999)).rejects.toThrow(NotFoundException);
      });
    });

    describe('abandonQuest', () => {
      it('should set status "abandonnée" when current status is waiting', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1 }); // STATUS_ID_WAITING = 1
        mockPrisma.quest!.update.mockResolvedValueOnce({ id: 1, status: { name: 'abandonnée' } });

        const res = await service.abandonQuest(1);
        expect(res).toEqual(expect.objectContaining({ status: expect.objectContaining({ name: 'abandonnée' }) }));
      });

      it('should fail with BadRequestException when current status is "validée"', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 2 }); // STATUS_ID_VALIDATED = 2
        await expect(service.abandonQuest(1)).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException when quest does not exist', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce(null as any);
        await expect(service.abandonQuest(999)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('business actions: validate/start/invalidate', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockPrisma.user!.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.status!.findUnique.mockResolvedValue({ id: 1 });
    });

    it('validateQuest should set status "validée" and XP', async () => {
      mockPrisma.status!.findFirst.mockResolvedValueOnce({ id: 5 });
      mockPrisma.quest!.update.mockResolvedValueOnce({
        id: 1, recommendedXP: 150, status: { name: 'validée' },
      });

      const res = await service.validateQuest(1, 150);
      expect(res).toEqual(expect.objectContaining({ recommendedXP: 150 }));
    });

    it('validateQuest should throw NotFoundException if Prisma throws P2025', async () => {
      const prismaError = createPrismaError('Not found', 'P2025');
      
      mockPrisma.quest!.update.mockRejectedValueOnce(prismaError);

      await expect(service.validateQuest(999, 100)).rejects.toThrow(NotFoundException);
    });

    it('validateQuest should re-throw generic errors', async () => {
      const error = new Error('Generic');
      mockPrisma.quest!.update.mockRejectedValueOnce(error);
      await expect(service.validateQuest(1, 100)).rejects.toThrow(error);
    });

    it('startQuest should fail if not validated', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1, estimatedDuration: 3, reward: 100, adventurers: [], questStockEquipments: [] }); // STATUS_ID_WAITING = 1
      await expect(service.startQuest(1)).rejects.toThrow(BadRequestException);
    });

    it('startQuest should set status "commencée", record startDate and set equipment to BORROWED', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ 
        statusId: 2, // STATUS_ID_VALIDATED = 2
        estimatedDuration: 5,
        reward: 1000,
        adventurers: [{ id: 1 }, { id: 2 }],
        questStockEquipments: [{ equipmentStockId: 10 }, { equipmentStockId: 11 }]
      });
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      
      mockPrisma.$transaction.mockImplementation(async (callback: any) => await callback({
        adventurer: { updateMany: (jest.fn() as JestMock).mockResolvedValue({ count: 2 }) },
        equipmentStock: { updateMany: (jest.fn() as JestMock).mockResolvedValue({ count: 2 }) },
        quest: { 
          update: (jest.fn() as JestMock).mockResolvedValue({ id: 1 }),
          findUnique: (jest.fn() as JestMock).mockResolvedValue({ name: 'Test Quest' })
        },
        transaction: { 
          findFirst: (jest.fn() as JestMock).mockResolvedValue({ total: 5000 }),
          create: (jest.fn() as JestMock).mockResolvedValue({})
        },
        adventurerRest: { 
          create: (jest.fn() as JestMock).mockResolvedValue({})
        },
      }));
      
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ 
        id: 1, 
        status: { name: 'commencée' },
        startDate: new Date(),
        questStockEquipments: [{ equipmentStock: { status: 'BORROWED' } }]
      });

      const res = await service.startQuest(1);
      expect(res).toEqual(expect.objectContaining({ status: expect.objectContaining({ name: 'commencée' }) }));
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('startQuest should throw NotFoundException if quest not found', async () => {
      mockPrisma.quest!.findUnique.mockReset();
      mockPrisma.quest!.findUnique.mockResolvedValueOnce(null);
      await expect(service.startQuest(999)).rejects.toThrow(NotFoundException);
    });

    it('invalidateQuest should fail if quest is started', async () => {
      // Réinitialiser le mock pour ce test
      mockPrisma.quest!.findUnique.mockReset();
      // isStarted() retourne true si statusId === 4
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 4 }); // STATUS_ID_STARTED = 4
      await expect(service.invalidateQuest(1)).rejects.toThrow(BadRequestException);
    });

    it('invalidateQuest should throw NotFoundException if quest does not exist', async () => {
       // Réinitialiser le mock pour ce test
       mockPrisma.quest!.findUnique.mockReset();
       // isStarted() appelle findUnique, si null il throw NotFoundException
       mockPrisma.quest!.findUnique.mockResolvedValueOnce(null);
       await expect(service.invalidateQuest(999)).rejects.toThrow(NotFoundException);
    });
    
    it('invalidateQuest should reset XP and status when not started', async () => {
      // Réinitialiser le mock pour ce test
      mockPrisma.quest!.findUnique.mockReset();
      // isStarted() vérifie le statut - retourne false si statusId !== 4
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 2 }); // STATUS_ID_VALIDATED = 2
      mockPrisma.$transaction.mockResolvedValueOnce({});
      // findOne() à la fin de invalidateQuest
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, status: { name: 'attendre pour la validation' } }); 
      
      const res = await service.invalidateQuest(1);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });
  });

  // ------------------------ ADDITIONAL COVERAGE TESTS ------------------------
  describe('additional findAll branches', () => {
    it('should build where with reward/statusId/finalDate/userId', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({
        rewardMin: 10,
        rewardMax: 200,
        statusId: 2,
        finalDateBefore: new Date().toISOString(),
        userId: 5,
        sortBy: 'reward',
        order: 'asc',
      });
      expect(mockPrisma.quest!.findMany).toHaveBeenCalled();
      expect(res).toEqual([]);
    });

    it('should compute avgExperience and filter/sort by avgExperience asc', async () => {
      const quests = [
        { id: 1, adventurers: [{ experience: 10 }, { experience: 20 }] },
        { id: 2, adventurers: [{ experience: 5 }] },
      ];
      mockPrisma.quest!.findMany.mockResolvedValue(quests as any);
      const res = await service.findAll({ sortBy: 'avgExperience', order: 'asc' });
      expect(Array.isArray(res)).toBe(true);
    });

    it('should compute avgExperience and sort by avgExperience desc and filter by avgXpMin/Max', async () => {
      const quests = [
        { id: 1, adventurers: [{ experience: 100 }] },
        { id: 2, adventurers: [{ experience: 10 }, { experience: 20 }] },
      ];
      mockPrisma.quest!.findMany.mockResolvedValue(quests as any);
      const res = await service.findAll({ sortBy: 'avgExperience', order: 'desc', avgXpMin: 15 });
      expect(Array.isArray(res)).toBe(true);
      expect((res as any).every((q: any) => q.avgExperience >= 15)).toBe(true);
    });

    it('updateStatus should throw BadRequestException when no status provided', async () => {
      await expect(service.updateStatus(1, {} as any)).rejects.toThrow();
    });
  });

  describe('more findAll permutations', () => {
    it('should handle rewardMin only', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({ rewardMin: 5 });
      expect(res).toEqual([]);
    });

    it('should handle rewardMax only', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({ rewardMax: 500 });
      expect(res).toEqual([]);
    });

    it('should handle statusId filter', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({ statusId: 2 });
      expect(res).toEqual([]);
    });

    it('should handle finalDateAfter only', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({ finalDateAfter: new Date().toISOString() });
      expect(res).toEqual([]);
    });

    it('should use finalDate orderBy when requested', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({ sortBy: 'finalDate', order: 'desc' });
      expect(res).toEqual([]);
    });

    it('should default to id order when unknown sortBy provided', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({ sortBy: 'createdAt' as any });
      expect(res).toEqual([]);
    });
  });

  describe('more branches: update/attachments', () => {
    it('should throw when updating started quest with adventurerIds', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 4 }); // STATUS_ID_STARTED = 4
      await expect(service.update(1, { adventurerIds: [1] } as any)).rejects.toThrow();
    });

    it('attachEquipmentStocks should handle case where nothing to insert', async () => {
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10 }]);
      
      mockPrisma.questStockEquipment!.findMany.mockResolvedValueOnce([{ equipmentStockId: 10 }]);
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, statusId: 1 }); // STATUS_ID_WAITING = 1
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1 });
      const res = await service.attachEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('setEquipmentStocks should work when given empty array', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, statusId: 1 }); // STATUS_ID_WAITING = 1
      mockPrisma.$transaction.mockResolvedValueOnce({});
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1 });
      const res = await service.setEquipmentStocks(1, []);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });
  });

  // ------------------------ FINISH QUEST ------------------------
  describe('finishQuest', () => {
    beforeEach(() => {
      mockPrisma.quest!.findUnique.mockReset();
    });

    it('should throw NotFoundException if quest not found', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValue(null);
      await expect(service.finishQuest(999, true)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quest is not started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValue({ 
        statusId: 2, // STATUS_ID_VALIDATED = 2
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        estimatedDuration: 5,
        recommendedXP: 100,
        reward: 500,
        adventurers: [],
        questStockEquipments: [],
      });
      await expect(service.finishQuest(1, true)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if quest has no start date', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValue({ 
        statusId: 4, // STATUS_ID_STARTED = 4
        startDate: null,
        estimatedDuration: 5,
        recommendedXP: 100,
        reward: 500,
        adventurers: [],
        questStockEquipments: [],
      });
      await expect(service.finishQuest(1, true)).rejects.toThrow(BadRequestException);
    });

    it('should finish quest with success: give XP, update equipment, calculate rest and salary', async () => {
      // StartDate 5 days ago to simulate 5 days duration
      const startDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const questData = {
        statusId: 4, // STATUS_ID_STARTED = 4
        startDate,
        estimatedDuration: 5,
        recommendedXP: 100,
        reward: 1000,
        adventurers: [
          { id: 1, experience: 50, dailyRate: 20 },
          { id: 2, experience: 80, dailyRate: 30 },
        ],
        questStockEquipments: [
          { equipmentStockId: 10, equipmentStock: { id: 10, durability: 10 } },
          { equipmentStockId: 11, equipmentStock: { id: 11, durability: 3 } },
        ],
      };
      
      let callCount = 0;
      mockPrisma.quest!.findUnique.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return questData;
        return {
          id: 1,
          statusId: 6,
          status: { name: 'Terminée' },
          adventurers: [{ id: 1 }, { id: 2 }],
          questStockEquipments: [],
        };
      });

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const txMock = {
          adventurer: { update: (jest.fn() as JestMock).mockResolvedValue({}) },
          equipmentStock: { update: (jest.fn() as JestMock).mockResolvedValue({}) },
          transaction: { 
            findFirst: (jest.fn() as JestMock).mockResolvedValue({ total: 1000 }),
            create: (jest.fn() as JestMock).mockResolvedValue({})
          },
          quest: { update: (jest.fn() as JestMock).mockResolvedValue({}) },
          adventurerRest: { 
            deleteMany: (jest.fn() as JestMock).mockResolvedValue({}),
            create: (jest.fn() as JestMock).mockResolvedValue({})
          },
        };
        await callback(txMock);
      });

      const res = await service.finishQuest(1, true);
      
      // Duration is calculated from startDate (5 or 6 days depending on exact timing)
      // totalCost = (20+30) * days = 50 * 5 = 250 or 50 * 6 = 300
      expect(res.totalCost).toBeGreaterThanOrEqual(250);
      expect(res.totalCost).toBeLessThanOrEqual(300);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should finish quest with failure: no XP, still update equipment and calculate salary', async () => {
      // StartDate 3 days ago
      const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const questData = {
        statusId: 4, // STATUS_ID_STARTED = 4
        startDate,
        estimatedDuration: 3,
        recommendedXP: 50,
        reward: 500,
        adventurers: [{ id: 1, experience: 100, dailyRate: 50 }],
        questStockEquipments: [
          { equipmentStockId: 10, equipmentStock: { id: 10, durability: 5 } },
        ],
      };
      
      let callCount = 0;
      mockPrisma.quest!.findUnique.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return questData;
        return {
          id: 1,
          statusId: 7,
          status: { name: 'Échouée' },
          adventurers: [{ id: 1, experience: 100 }],
          questStockEquipments: [],
        };
      });

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const txMock = {
          adventurer: { update: (jest.fn() as JestMock).mockResolvedValue({}) },
          equipmentStock: { update: (jest.fn() as JestMock).mockResolvedValue({}) },
          transaction: {
            findFirst: (jest.fn() as JestMock).mockResolvedValue(null),
            create: (jest.fn() as JestMock).mockResolvedValue({})
          },
          quest: { update: (jest.fn() as JestMock).mockResolvedValue({}) },
          adventurerRest: { 
            deleteMany: (jest.fn() as JestMock).mockResolvedValue({}),
            create: (jest.fn() as JestMock).mockResolvedValue({})
          },
        };
        await callback(txMock);
      });

      const res = await service.finishQuest(1, false);
      
      // Duration is calculated from startDate (3 days + ceil rounding)
      // totalCost = 50 * 3 = 150 (or 50 * 4 = 200 depending on exact time)
      expect(res.totalCost).toBeGreaterThanOrEqual(150);
      expect(res.totalCost).toBeLessThanOrEqual(200);
      expect(res.statusId).toBe(7); // STATUS_ID_FAILED
    });

    it('should handle quest with no adventurers', async () => {
      // StartDate 2 days ago
      const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const questData = {
        statusId: 4, // STATUS_ID_STARTED = 4
        startDate,
        estimatedDuration: 2,
        recommendedXP: 30,
        reward: 200,
        adventurers: [],
        questStockEquipments: [],
      };
      
      let callCount = 0;
      mockPrisma.quest!.findUnique.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return questData;
        return {
          id: 1,
          statusId: 6,
          adventurers: [],
          questStockEquipments: [],
        };
      });

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        await callback({
          adventurer: { update: jest.fn() as JestMock },
          equipmentStock: { update: jest.fn() as JestMock },
          transaction: { findFirst: jest.fn() as JestMock, create: jest.fn() as JestMock },
          quest: { update: (jest.fn() as JestMock).mockResolvedValue({}) },
          adventurerRest: { 
            deleteMany: (jest.fn() as JestMock).mockResolvedValue({}),
            create: (jest.fn() as JestMock).mockResolvedValue({})
          },
        });
      });

      const res = await service.finishQuest(1, true);
      expect(res.totalCost).toBe(0);
    });
  });

  // ------------------------ CONSUMABLES MANAGEMENT ------------------------
  describe('consumables management', () => {
    beforeEach(() => {
      mockPrisma.quest!.findUnique.mockReset();
      mockPrisma.consumable!.findMany.mockReset();
      mockPrisma.questConsumable!.findMany.mockReset();
      mockPrisma.questConsumable!.createMany.mockReset();
      mockPrisma.questConsumable!.deleteMany.mockReset();
      mockPrisma.questConsumable!.update.mockReset();
      mockPrisma.questConsumable!.delete.mockReset();
      mockPrisma.questConsumable!.upsert.mockReset();
    });

    it('attachConsumables should attach new consumables', async () => {
      mockPrisma.consumable!.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]) // findConsumablesExist
        .mockResolvedValueOnce([{ id: 1, quantity: 100, name: 'Potion' }, { id: 2, quantity: 50, name: 'Antidote' }]); // stock check
      mockPrisma.questConsumable!.findMany.mockResolvedValueOnce([]); // existing in this quest (none)
      mockPrisma.questConsumable!.createMany.mockResolvedValueOnce({ count: 2 });
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, questConsumables: [] });

      const res = await service.attachConsumables(1, [
        { consumableId: 1, quantity: 5 },
        { consumableId: 2, quantity: 3 },
      ]);
      expect(mockPrisma.questConsumable!.createMany).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('attachConsumables should add quantity to existing consumable', async () => {
      mockPrisma.consumable!.findMany
        .mockResolvedValueOnce([{ id: 1 }]) // findConsumablesExist
        .mockResolvedValueOnce([{ id: 1, quantity: 100, name: 'Potion' }]); // stock check
      mockPrisma.questConsumable!.findMany.mockResolvedValueOnce([{ consumableId: 1, quantity: 5 }]); // existing in this quest (already has 5)
      mockPrisma.questConsumable!.update.mockResolvedValueOnce({});
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, questConsumables: [{ consumableId: 1, quantity: 8 }] });

      const res = await service.attachConsumables(1, [
        { consumableId: 1, quantity: 3 }, // Should add 3 to existing 5 = 8
      ]);
      expect(mockPrisma.questConsumable!.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { questId_consumableId: { questId: 1, consumableId: 1 } },
        data: { quantity: 8 }, // 5 existing + 3 new
      }));
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('attachConsumables should throw NotFoundException if consumable not found', async () => {
      mockPrisma.consumable!.findMany.mockResolvedValueOnce([{ id: 1 }]); // Missing id: 2
      await expect(
        service.attachConsumables(1, [{ consumableId: 1, quantity: 5 }, { consumableId: 2, quantity: 3 }])
      ).rejects.toThrow(NotFoundException);
    });

    it('attachConsumables should throw BadRequestException if not enough stock', async () => {
      mockPrisma.consumable!.findMany
        .mockResolvedValueOnce([{ id: 1 }]) // findConsumablesExist
        .mockResolvedValueOnce([{ id: 1, quantity: 2, name: 'Potion' }]); // stock check - only 2 available
      mockPrisma.questConsumable!.findMany.mockResolvedValueOnce([]); // no existing in this quest
      
      await expect(
        service.attachConsumables(1, [{ consumableId: 1, quantity: 10 }])
      ).rejects.toThrow(BadRequestException);
    });

    it('attachConsumables should throw BadRequestException if stock minus already assigned is not enough', async () => {
      mockPrisma.consumable!.findMany
        .mockResolvedValueOnce([{ id: 1 }]) // findConsumablesExist
        .mockResolvedValueOnce([{ id: 1, quantity: 20, name: 'Potion' }]); // stock has 20
      mockPrisma.questConsumable!.findMany.mockResolvedValueOnce([{ consumableId: 1, quantity: 15 }]); // already assigned 15 in this quest
      
      // Trying to add 10, but only 5 available (20 - 15)
      await expect(
        service.attachConsumables(1, [{ consumableId: 1, quantity: 10 }])
      ).rejects.toThrow(BadRequestException);
    });

    it('detachConsumables should fully remove consumable when quantity becomes <= 0', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1 }); // isStarted check
      mockPrisma.consumable!.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]); // findConsumablesExist
      mockPrisma.questConsumable!.findMany.mockResolvedValueOnce([
        { consumableId: 1, quantity: 5 },
        { consumableId: 2, quantity: 3 },
      ]);
      mockPrisma.questConsumable!.delete.mockResolvedValue({});
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, questConsumables: [] });

      const res = await service.detachConsumables(1, [
        { consumableId: 1, quantity: 10 }, // More than existing, should delete
        { consumableId: 2, quantity: 3 },  // Exact quantity, should delete
      ]);
      expect(mockPrisma.questConsumable!.delete).toHaveBeenCalledTimes(2);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('detachConsumables should reduce quantity when remaining > 0', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1 }); // isStarted check
      mockPrisma.consumable!.findMany.mockResolvedValueOnce([{ id: 1 }]); // findConsumablesExist
      mockPrisma.questConsumable!.findMany.mockResolvedValueOnce([
        { consumableId: 1, quantity: 10 },
      ]);
      mockPrisma.questConsumable!.update.mockResolvedValueOnce({});
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, questConsumables: [{ consumableId: 1, quantity: 7 }] });

      const res = await service.detachConsumables(1, [
        { consumableId: 1, quantity: 3 }, // 10 - 3 = 7, should update
      ]);
      expect(mockPrisma.questConsumable!.update).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('detachConsumables should throw BadRequestException if quest is started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 4 }); // STATUS_ID_STARTED
      await expect(service.detachConsumables(1, [{ consumableId: 1, quantity: 5 }])).rejects.toThrow(BadRequestException);
    });

    it('detachConsumables should skip consumables not in quest', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1 }); // isStarted check
      mockPrisma.consumable!.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 999 }]); // findConsumablesExist (both exist in DB)
      mockPrisma.questConsumable!.findMany.mockResolvedValueOnce([
        { consumableId: 1, quantity: 5 },
        // 999 is not in the quest
      ]);
      mockPrisma.questConsumable!.delete.mockResolvedValueOnce({});
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, questConsumables: [] });

      const res = await service.detachConsumables(1, [
        { consumableId: 1, quantity: 5 },
        { consumableId: 999, quantity: 2 }, // Not in quest, should be skipped
      ]);
      expect(mockPrisma.questConsumable!.delete).toHaveBeenCalledTimes(1);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('setConsumables should replace all consumables', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1 }); // isStarted check
      mockPrisma.consumable!.findMany
        .mockResolvedValueOnce([{ id: 3 }]) // findConsumablesExist
        .mockResolvedValueOnce([{ id: 3, quantity: 50, name: 'Elixir' }]); // stock check
      mockPrisma.questConsumable!.deleteMany.mockResolvedValueOnce({ count: 2 });
      mockPrisma.questConsumable!.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, questConsumables: [{ consumableId: 3 }] });

      const res = await service.setConsumables(1, [{ consumableId: 3, quantity: 7 }]);
      expect(mockPrisma.questConsumable!.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.questConsumable!.createMany).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('setConsumables should throw BadRequestException if quest is started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 4 }); // STATUS_ID_STARTED
      await expect(service.setConsumables(1, [{ consumableId: 1, quantity: 5 }])).rejects.toThrow(BadRequestException);
    });

    it('setConsumables with empty array should just delete all', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1 }); // isStarted check
      mockPrisma.questConsumable!.deleteMany.mockResolvedValueOnce({ count: 2 });
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, questConsumables: [] });

      const res = await service.setConsumables(1, []);
      expect(mockPrisma.questConsumable!.deleteMany).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });
  });
});