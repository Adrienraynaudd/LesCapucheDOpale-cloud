import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuestStockEquipmentService } from '../services/quest-stock-equipment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestStockEquipmentDto } from '../dto/create-quest-stock-equipment.dto';
import { EquipmentStock, Quest, QuestStockEquipment, Prisma } from '@prisma/client';

type PrismaMock = {
  questStockEquipment: {
    create: jest.Mock;
    findMany: jest.Mock;
    delete: jest.Mock;
  };
  quest: {
    findUnique: jest.Mock;
  };
  equipmentStock: {
    findUnique: jest.Mock;
  };
};

describe('QuestStockEquipmentService', () => {
  let service: QuestStockEquipmentService;
  let mockPrisma: PrismaMock;

  beforeEach(async () => {
    mockPrisma = {
      questStockEquipment: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      quest: {
        findUnique: jest.fn(),
      },
      equipmentStock: {
        findUnique: jest.fn(),
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

  // --- ATTACH ---
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

  // --- FIND ALL ---
  describe('findAll', () => {
    it('should find all quest stock equipment (no filter)', async () => {
      mockPrisma.questStockEquipment.findMany.mockResolvedValue([]);

      await service.findAll();
      
      // Vérifie la branche "else" du ternaire (undefined)
      expect(mockPrisma.questStockEquipment.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { quest: true, equipmentStock: true },
      });
    });

    it('should find quest stock equipment filtered by questId', async () => {
      mockPrisma.questStockEquipment.findMany.mockResolvedValue([]);

      await service.findAll(5);

      // Vérifie la branche "if" du ternaire ({ questId: 5 })
      expect(mockPrisma.questStockEquipment.findMany).toHaveBeenCalledWith({
        where: { questId: 5 },
        include: { quest: true, equipmentStock: true },
      });
    });
  });

  // --- DELETE ---
  describe('delete', () => {
    it('should delete a quest stock equipment', async () => {
      mockPrisma.questStockEquipment.delete.mockResolvedValue({
        id: 10,
      } as QuestStockEquipment);

      const result = await service.delete(10);
      expect(result.id).toBe(10);
    });

    // CORRECTION : Simulation correcte de P2025 pour couvrir la ligne 38
    it('should throw NotFoundException if delete fails with P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Link not found',
        { code: 'P2025', clientVersion: '1.0' } as any,
      );

      mockPrisma.questStockEquipment.delete.mockRejectedValue(prismaError);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    // AJOUT : Pour couvrir le "throw e" final
    it('should re-throw generic errors', async () => {
      const error = new Error('Generic DB Error');
      mockPrisma.questStockEquipment.delete.mockRejectedValue(error);

      await expect(service.delete(10)).rejects.toThrow(error);
    });
  });
});