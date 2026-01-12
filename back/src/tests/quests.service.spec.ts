import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuestsService } from '../services/quests.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Prisma } from '@prisma/client';

type JestMock = any;

type MockedPrismaService = Partial<{
  status: { findFirst: JestMock; findUnique: JestMock };
  adventurer: { findMany: JestMock; updateMany: JestMock; update: JestMock };
  equipmentStock: { findMany: JestMock; update: JestMock; updateMany: JestMock };
  questStockEquipment: { findMany: JestMock; createMany: JestMock; deleteMany: JestMock };
  quest: { create: JestMock; update: JestMock; findMany: JestMock; findUnique: JestMock };
  user: { findUnique: JestMock };
  transaction: { findFirst: JestMock; create: JestMock };
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
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user!.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.status!.findUnique.mockResolvedValue({ id: 1 });
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
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);
      
      mockPrisma.quest!.update.mockRejectedValue(prismaError);

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
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);
      
      mockPrisma.quest!.update.mockRejectedValue(prismaError);

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
    });

    it('should attach adventurers', async () => {
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      const res = await service.attachAdventurers(1, [1, 2]);
      expect(res).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if Prisma throws P2025 during attach', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);
      
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.quest!.update.mockRejectedValue(prismaError);
      await expect(service.attachAdventurers(999, [1])).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors during attach', async () => {
      const error = new Error('Fail');
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.attachAdventurers(1, [1])).rejects.toThrow(error);
    });

    it('should detach adventurers', async () => {
      mockPrisma.adventurer!.findMany.mockResolvedValueOnce([{ id: 1 }]);
      const res = await service.detachAdventurers(1, [1]);
      expect(res).toEqual({ id: 1 });
    });

    it('should set adventurers', async () => {
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([])
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
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10 }]);
    });

    it('should attach equipment stocks', async () => {
      const res = await service.attachEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should detach equipment stocks', async () => {
      const res = await service.detachEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should set equipment stocks', async () => {
      const res = await service.setEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
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
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);
      
      mockPrisma.quest!.update.mockRejectedValue(prismaError);

      await expect(service.validateQuest(999, 100)).rejects.toThrow(NotFoundException);
    });

    it('validateQuest should re-throw generic errors', async () => {
      const error = new Error('Generic');
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.validateQuest(1, 100)).rejects.toThrow(error);
    });

    it('startQuest should fail if not validated', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 1, estimatedDuration: 3, adventurers: [] }); // STATUS_ID_WAITING = 1
      await expect(service.startQuest(1)).rejects.toThrow(BadRequestException);
    });

    it('startQuest should set status "commencée", record startDate and set equipment to BORROWED', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ 
        statusId: 2, // STATUS_ID_VALIDATED = 2
        estimatedDuration: 5,
        adventurers: [{ id: 1 }, { id: 2 }],
        questStockEquipments: [{ equipmentStockId: 10 }, { equipmentStockId: 11 }]
      });
      mockPrisma.adventurer!.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      
      mockPrisma.$transaction.mockImplementation(async (callback: any) => await callback({
        adventurer: { updateMany: (jest.fn() as JestMock).mockResolvedValue({ count: 2 }) },
        equipmentStock: { updateMany: (jest.fn() as JestMock).mockResolvedValue({ count: 2 }) },
        quest: { update: (jest.fn() as JestMock).mockResolvedValue({ id: 1 }) },
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
      mockPrisma.quest!.findUnique.mockResolvedValueOnce(null);
      await expect(service.startQuest(999)).rejects.toThrow(NotFoundException);
    });

    it('invalidateQuest should fail if quest is started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 3 }); // STATUS_ID_STARTED = 3
      await expect(service.invalidateQuest(1)).rejects.toThrow(BadRequestException);
    });

    it('invalidateQuest should throw NotFoundException if quest does not exist', async () => {
       mockPrisma.quest!.findUnique.mockResolvedValueOnce(null);
       await expect(service.invalidateQuest(999)).rejects.toThrow(NotFoundException);
    });
    
    it('invalidateQuest should reset XP and status when not started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 2 }); // STATUS_ID_VALIDATED = 2
      mockPrisma.$transaction.mockResolvedValueOnce({});
      mockPrisma.quest!.update.mockResolvedValueOnce({ id: 1, status: { name: 'attendre pour la validation' } });

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
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ statusId: 3 }); // STATUS_ID_STARTED = 3
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
      await expect(service.finishQuest(999, true, 5)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quest is not started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValue({ 
        statusId: 2, // STATUS_ID_VALIDATED = 2
        estimatedDuration: 5,
        recommendedXP: 100,
        adventurers: [],
        questStockEquipments: [],
      });
      await expect(service.finishQuest(1, true, 5)).rejects.toThrow(BadRequestException);
    });

    it('should finish quest with success: give XP, update equipment, calculate rest and salary', async () => {
      const questData = {
        statusId: 3, // STATUS_ID_STARTED
        estimatedDuration: 5,
        recommendedXP: 100,
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
        };
        await callback(txMock);
      });

      const res = await service.finishQuest(1, true, 5);
      
      expect(res.totalCost).toBe(250); // (20*5) + (30*5) = 100 + 150 = 250
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should finish quest with failure: no XP, still update equipment and calculate salary', async () => {
      const questData = {
        statusId: 3, // STATUS_ID_STARTED
        estimatedDuration: 3,
        recommendedXP: 50,
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
        };
        await callback(txMock);
      });

      const res = await service.finishQuest(1, false, 3);
      
      expect(res.totalCost).toBe(150); // 50*3 = 150
      expect(res.statusId).toBe(7); // STATUS_ID_FAILED
    });

    it('should handle quest with no adventurers', async () => {
      const questData = {
        statusId: 3,
        estimatedDuration: 2,
        recommendedXP: 30,
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
        });
      });

      const res = await service.finishQuest(1, true, 2);
      expect(res.totalCost).toBe(0);
    });
  });
});