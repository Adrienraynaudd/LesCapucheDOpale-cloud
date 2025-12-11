import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuestsService } from '../services/quests.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Prisma } from '@prisma/client';

// CORRECTION MAJEURE : On utilise 'any' pour éviter les conflits de types stricts de Jest
type JestMock = any;

type MockedPrismaService = Partial<{
  status: { findFirst: JestMock; create: JestMock };
  adventurer: { findMany: JestMock };
  equipmentStock: { findMany: JestMock };
  questStockEquipment: { findMany: JestMock; createMany: JestMock; deleteMany: JestMock };
  quest: { create: JestMock; update: JestMock; findMany: JestMock; findUnique: JestMock };
  $transaction: JestMock;
}>;

describe('QuestsService', () => {
  let service: QuestsService;

  const mockPrisma: MockedPrismaService = {
    status: { findFirst: jest.fn(), create: jest.fn() },
    adventurer: { findMany: jest.fn() },
    equipmentStock: { findMany: jest.fn() },
    questStockEquipment: { findMany: jest.fn(), createMany: jest.fn(), deleteMany: jest.fn() },
    quest: { create: jest.fn(), update: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestsService(mockPrisma as unknown as PrismaService);
  });

  // ------------------------ CREATE ------------------------
  describe('create', () => {
    it('should create a quest when status exists (getOrCreateStatusId found path)', async () => {
      const dto: CreateQuestDto = {
        name: 'Q1', description: 'desc', finalDate: new Date(), reward: 100, estimatedDuration: 3,
        adventurerIds: [1, 2], equipmentStockIds: [10, 11],
      };
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 7 });
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockPrisma.quest!.create.mockResolvedValue({ id: 99, ...dto });

      const res = await service.create(42, dto);
      expect(res).toEqual(expect.objectContaining({ id: 99 }));
      expect(mockPrisma.status!.create).not.toHaveBeenCalled();
    });

    it('should create a quest when status does not exist (getOrCreateStatusId create path)', async () => {
      // CORRECTION DTO : Ajout des champs requis pour éviter l'erreur TS
      const dto: CreateQuestDto = { 
        name: 'Q2', 
        reward: 50, 
        estimatedDuration: 1,
        description: 'Auto description',
        finalDate: new Date()
      };
      
      mockPrisma.status!.findFirst.mockResolvedValue(null);
      mockPrisma.status!.create.mockResolvedValue({ id: 999 });
      mockPrisma.quest!.create.mockResolvedValue({ id: 100 });

      await service.create(42, dto);
      
      expect(mockPrisma.status!.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if adventurer id missing', async () => {
      const dto: Partial<CreateQuestDto> = { name: 'Q3', adventurerIds: [1, 2] };
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 1 }]);
      await expect(service.create(1, dto as CreateQuestDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(1, dto as CreateQuestDto)).rejects.toThrow(/Adventurer id\(s\) not found/);
    });

    it('should throw NotFoundException if equipmentStock id missing', async () => {
      const dto: Partial<CreateQuestDto> = { name: 'Q4', equipmentStockIds: [10, 11] };
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10 }]);
      
      await expect(service.create(1, dto as CreateQuestDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ------------------------ UPDATE ------------------------
  describe('update', () => {
    beforeEach(() => {
      mockPrisma.quest!.findUnique.mockResolvedValue({ status: { name: 'attendre pour la validation' } });
    });

    it('should update quest and set adventurers and questStockEquipments when arrays provided', async () => {
      const dto: Partial<UpdateQuestDto> = { name: 'Updated', adventurerIds: [3, 4], equipmentStockIds: [20] };
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 3 }, { id: 4 }]);
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

  // ------------------------ FIND ------------------------
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

  // ------------------------ STATUS ------------------------
  describe('updateStatus', () => {
    it('should update quest status by id', async () => {
      const quest = { id: 1, statusId: 2 };
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.quest!.update.mockResolvedValue(quest);
      const res = await service.updateStatus(1, { statusName: 'Active' });
      expect(res).toBe(quest);
    });

    it('should throw NotFoundException if status not found', async () => {
      mockPrisma.status!.findFirst.mockResolvedValue(null);
      await expect(service.updateStatus(1, { statusName: 'Bad' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if Prisma throws P2025 during status update', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);
      
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.quest!.update.mockRejectedValue(prismaError);

      await expect(service.updateStatus(999, { statusName: 'Active' })).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors during status update', async () => {
      const error = new Error('Generic');
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.updateStatus(1, { statusName: 'Active' })).rejects.toThrow(error);
    });
  });

  // ------------------------ ADVENTURER HELPERS ------------------------
  describe('adventurer helpers', () => {
    beforeEach(() => {
      mockPrisma.quest!.update.mockResolvedValue({ id: 1 });
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrisma.quest!.findUnique.mockResolvedValue({ status: { name: 'attendre pour la validation' } });
    });

    it('should attach adventurers', async () => {
      const res = await service.attachAdventurers(1, [1, 2]);
      expect(res).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if Prisma throws P2025 during attach', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);
      
      mockPrisma.quest!.update.mockRejectedValue(prismaError);
      await expect(service.attachAdventurers(999, [1])).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors during attach', async () => {
      const error = new Error('Fail');
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.attachAdventurers(1, [1])).rejects.toThrow(error);
    });

    it('should detach adventurers', async () => {
      const res = await service.detachAdventurers(1, [1]);
      expect(res).toEqual({ id: 1 });
    });

    it('should set adventurers', async () => {
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
      mockPrisma.quest!.findUnique.mockResolvedValue({ id: 1, status: { name: 'attendre pour la validation' } });
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
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'attendre pour la validation' } });
        mockPrisma.status!.findFirst.mockResolvedValueOnce({ id: 21 });
        mockPrisma.quest!.update.mockResolvedValueOnce({ id: 1, status: { name: 'refusée' } });

        const res = await service.refuseQuest(1);
        expect(res).toEqual(expect.objectContaining({ status: expect.objectContaining({ name: 'refusée' }) }));
      });

      it('should fail with BadRequestException when current status is "validée"', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'validée' } });
        await expect(service.refuseQuest(1)).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException when quest does not exist', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce(null as any);
        await expect(service.refuseQuest(999)).rejects.toThrow(NotFoundException);
      });
    });

    describe('abandonQuest', () => {
      it('should set status "abandonnée" when current status is waiting', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'attendre pour la validation' } });
        mockPrisma.status!.findFirst.mockResolvedValueOnce({ id: 22 });
        mockPrisma.quest!.update.mockResolvedValueOnce({ id: 1, status: { name: 'abandonnée' } });

        const res = await service.abandonQuest(1);
        expect(res).toEqual(expect.objectContaining({ status: expect.objectContaining({ name: 'abandonnée' }) }));
      });

      it('should fail with BadRequestException when current status is "validée"', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'validée' } });
        await expect(service.abandonQuest(1)).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException when quest does not exist', async () => {
        mockPrisma.quest!.findUnique.mockResolvedValueOnce(null as any);
        await expect(service.abandonQuest(999)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('business actions: validate/start/invalidate', () => {
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
      
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 5 });
      mockPrisma.quest!.update.mockRejectedValue(prismaError);

      await expect(service.validateQuest(999, 100)).rejects.toThrow(NotFoundException);
    });

    it('validateQuest should re-throw generic errors', async () => {
      const error = new Error('Generic');
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 5 });
      mockPrisma.quest!.update.mockRejectedValue(error);
      await expect(service.validateQuest(1, 100)).rejects.toThrow(error);
    });

    it('startQuest should fail if not validated', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'attendre pour la validation' } });
      await expect(service.startQuest(1)).rejects.toThrow(BadRequestException);
    });

    it('startQuest should set status "commencée" when validated', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'validée' } });
      mockPrisma.status!.findFirst.mockResolvedValueOnce({ id: 9 });
      mockPrisma.quest!.update.mockResolvedValueOnce({ id: 1, status: { name: 'commencée' } });

      const res = await service.startQuest(1);
      expect(res).toEqual(expect.objectContaining({ status: expect.objectContaining({ name: 'commencée' }) }));
    });

    it('startQuest should throw NotFoundException if quest not found', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce(null);
      await expect(service.startQuest(999)).rejects.toThrow(NotFoundException);
    });

    it('invalidateQuest should fail if quest is started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'commencée' } });
      await expect(service.invalidateQuest(1)).rejects.toThrow(BadRequestException);
    });

    it('invalidateQuest should throw NotFoundException if quest does not exist', async () => {
       mockPrisma.quest!.findUnique.mockResolvedValueOnce(null);
       await expect(service.invalidateQuest(999)).rejects.toThrow(NotFoundException);
    });
    
    it('invalidateQuest should reset XP and status when not started', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'validée' } });
      mockPrisma.status!.findFirst.mockResolvedValueOnce({ id: 1 });
      mockPrisma.$transaction.mockResolvedValueOnce({});
      mockPrisma.quest!.update.mockResolvedValueOnce({ id: 1, status: { name: 'attendre pour la validation' } });

      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, status: { name: 'attendre pour la validation' } }); 
      
      const res = await service.invalidateQuest(1);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });
  });

  // ------------------------ ADDITIONAL COVERAGE TESTS ------------------------
  describe('additional findAll branches', () => {
    it('should build where with reward/statusName/finalDate/userId', async () => {
      mockPrisma.quest!.findMany.mockResolvedValue([]);
      const res = await service.findAll({
        rewardMin: 10,
        rewardMax: 200,
        statusName: 'Active',
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
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ status: { name: 'commencée' } });
      await expect(service.update(1, { adventurerIds: [1] } as any)).rejects.toThrow();
    });

    it('attachEquipmentStocks should handle case where nothing to insert', async () => {
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([{ id: 10 }]);
      
      mockPrisma.questStockEquipment!.findMany.mockResolvedValueOnce([{ equipmentStockId: 10 }]);
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, status: { name: 'attendre pour la validation' } });
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1 });
      const res = await service.attachEquipmentStocks(1, [10]);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('setEquipmentStocks should work when given empty array', async () => {
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1, status: { name: 'attendre pour la validation' } });
      mockPrisma.$transaction.mockResolvedValueOnce({});
      mockPrisma.quest!.findUnique.mockResolvedValueOnce({ id: 1 });
      const res = await service.setEquipmentStocks(1, []);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });
  });
});