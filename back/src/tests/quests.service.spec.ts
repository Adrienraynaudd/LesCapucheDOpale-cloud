import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuestsService } from '../services/quests.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

type JestMock = ReturnType<typeof jest.fn>;

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
    it('should create a quest when status exists and relations exist', async () => {
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
      await expect(service.create(1, dto as CreateQuestDto)).rejects.toThrow(/EquipmentStock id\(s\) not found/);
    });
  });

  // ------------------------ UPDATE ------------------------
  describe('update', () => {
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

    it('should throw NotFoundException if adventurer in update missing', async () => {
      const dto: Partial<UpdateQuestDto> = { adventurerIds: [8, 9] };
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 8 }]);
      await expect(service.update(1, dto as UpdateQuestDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, dto as UpdateQuestDto)).rejects.toThrow(/Adventurer id\(s\) not found/);
    });

    it('should throw NotFoundException if equipmentStock in update missing', async () => {
      const dto: Partial<UpdateQuestDto> = { equipmentStockIds: [100] };
      mockPrisma.status!.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.equipmentStock!.findMany.mockResolvedValue([]);
      await expect(service.update(1, dto as UpdateQuestDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, dto as UpdateQuestDto)).rejects.toThrow(/EquipmentStock id\(s\) not found/);
    });
  });

  // ------------------------ FIND ------------------------
  it('should return quests with relations', async () => {
    const quests = [{ id: 1, name: 'Quest1' }];
    mockPrisma.quest!.findMany.mockResolvedValue(quests);
    const res = await service.findAll();
    expect(res).toBe(quests);
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

  // ------------------------ ADVENTURER HELPERS ------------------------
  describe('adventurer helpers', () => {
    beforeEach(() => {
      mockPrisma.quest!.update.mockResolvedValue({ id: 1 });
      mockPrisma.adventurer!.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    });

    it('should attach adventurers', async () => {
      const res = await service.attachAdventurers(1, [1, 2]);
      expect(res).toEqual({ id: 1 });
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
      mockPrisma.questStockEquipment!.findMany!.mockResolvedValue([]);
      mockPrisma.questStockEquipment!.createMany!.mockResolvedValue({});
      mockPrisma.questStockEquipment!.deleteMany!.mockResolvedValue({});
      mockPrisma.$transaction!.mockResolvedValue({});
      mockPrisma.quest!.findUnique!.mockResolvedValue({ id: 1 });
      mockPrisma.equipmentStock!.findMany!.mockResolvedValue([{ id: 10 }]);
    });

    it('should attach equipment stocks', async () => {
      const res = await service.attachEquipmentStocks(1, [10]);
      expect(res).toEqual({ id: 1 });
    });

    it('should detach equipment stocks', async () => {
      const res = await service.detachEquipmentStocks(1, [10]);
      expect(res).toEqual({ id: 1 });
    });

    it('should set equipment stocks', async () => {
      const res = await service.setEquipmentStocks(1, [10]);
      expect(res).toEqual({ id: 1 });
    });
  });
});
