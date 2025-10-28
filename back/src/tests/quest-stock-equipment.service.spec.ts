import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuestStockEquipmentService } from '../services/quest-stock-equipment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestStockEquipmentDto } from '../dto/create-quest-stock-equipment.dto';
import { EquipmentStock, Quest, QuestStockEquipment } from '@prisma/client';

type PrismaMock = {
  questStockEquipment: {
    create: jest.Mock<Promise<QuestStockEquipment>, [any]>;
    findMany: jest.Mock<Promise<QuestStockEquipment[]>, [any?]>;
    delete: jest.Mock<Promise<QuestStockEquipment>, [any]>;
  };
  quest: {
    findUnique: jest.Mock<Promise<Quest | null>, [any]>;
  };
  equipmentStock: {
    findUnique: jest.Mock<Promise<EquipmentStock | null>, [any]>;
  };
};

describe('QuestStockEquipmentService', () => {
  let service: QuestStockEquipmentService;
  let mockPrisma: PrismaMock;

  beforeEach(async () => {
    mockPrisma = {
      questStockEquipment: {
        create: jest.fn() as jest.Mock<Promise<QuestStockEquipment>, [any]>,
        findMany: jest.fn() as jest.Mock<
          Promise<QuestStockEquipment[]>,
          [any?]
        >,
        delete: jest.fn() as jest.Mock<Promise<QuestStockEquipment>, [any]>,
      },
      quest: {
        findUnique: jest.fn() as jest.Mock<Promise<Quest | null>, [any]>,
      },
      equipmentStock: {
        findUnique: jest.fn() as jest.Mock<
          Promise<EquipmentStock | null>,
          [any]
        >,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestStockEquipmentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<QuestStockEquipmentService>(
      QuestStockEquipmentService,
    );
  });

  it('should create a quest stock equipment', async () => {
    const dto: CreateQuestStockEquipmentDto = {
      questId: 1,
      equipmentStockId: 2,
    };

    mockPrisma.quest.findUnique.mockResolvedValue({ id: 1 } as Quest);
    mockPrisma.equipmentStock.findUnique.mockResolvedValue({
      id: 2,
    } as EquipmentStock);
    mockPrisma.questStockEquipment.create.mockResolvedValue({
      id: 10,
      questId: 1,
      equipmentStockId: 2,
      equipmentId: null,
      quest: { id: 1 },
      equipmentStock: { id: 2 },
    } as QuestStockEquipment);

    const result = await service.attach(dto);

    expect(result.id).toBe(10);
    expect(mockPrisma.questStockEquipment.create).toHaveBeenCalled();
  });

  it('should throw if quest does not exist', async () => {
    mockPrisma.quest.findUnique.mockResolvedValue(null);

    await expect(
      service.attach({ questId: 999, equipmentStockId: 2 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if equipment stock does not exist', async () => {
    mockPrisma.quest.findUnique.mockResolvedValue({ id: 1 } as Quest);
    mockPrisma.equipmentStock.findUnique.mockResolvedValue(null);

    await expect(
      service.attach({ questId: 1, equipmentStockId: 999 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find all quest stock equipment', async () => {
    mockPrisma.questStockEquipment.findMany.mockResolvedValue([
      {
        id: 10,
        questId: 1,
        equipmentStockId: 2,
        equipmentId: null,
        quest: { id: 1 },
        equipmentStock: { id: 2 },
      },
    ] as unknown as QuestStockEquipment[]);

    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should delete a quest stock equipment', async () => {
    mockPrisma.questStockEquipment.delete.mockResolvedValue({
      id: 10,
      questId: 1,
      equipmentStockId: 2,
      equipmentId: null,
    } as QuestStockEquipment);

    const result = await service.delete(10);
    expect(result.id).toBe(10);
    expect(mockPrisma.questStockEquipment.delete).toHaveBeenCalledWith({
      where: { id: 10 },
    });
  });

  it('should throw NotFoundException if delete fails with P2025', async () => {
    mockPrisma.questStockEquipment.delete.mockRejectedValue(
      new NotFoundException('Quest stock equipment not found'),
    );

    await expect(service.delete(999)).rejects.toThrow(NotFoundException);
  });

});
