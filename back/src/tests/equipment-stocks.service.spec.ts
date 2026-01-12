import { NotFoundException } from '@nestjs/common';
import { EquipmentStocksService } from '../services/equipment-stocks.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentStockDto } from '../dto/create-equipment-stock.dto';
import { UpdateEquipmentStockDto } from '../dto/update-equipment-stock.dto';
import { equipmentStockInclude } from '../dbo/equipment-stock.dbo';
import { Prisma } from '@prisma/client';

describe('EquipmentStocksService', () => {
  let service: EquipmentStocksService;

  const mockPrisma = {
    equipmentStock: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    equipment: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EquipmentStocksService(
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('should create an equipment stock with auto durability from maxDurability', async () => {
      const dto: CreateEquipmentStockDto = { equipmentId: 1 };
      mockPrisma.equipment.findUnique.mockResolvedValue({ id: 1, maxDurability: 100 });
      mockPrisma.equipmentStock.create.mockResolvedValue({
        id: 1,
        equipmentId: 1,
        durability: 100,
        equipment: { id: 1, maxDurability: 100 },
      });

      const res = await service.create(dto);

      expect(mockPrisma.equipment.findUnique).toHaveBeenCalledWith({
        where: { id: dto.equipmentId },
      });
      expect(mockPrisma.equipmentStock.create).toHaveBeenCalledWith({
        data: { equipmentId: dto.equipmentId, durability: 100 },
        include: equipmentStockInclude,
      });
      expect(res).toEqual(expect.objectContaining({ id: 1, equipmentId: 1 }));
    });

    it('should throw NotFoundException if equipment does not exist', async () => {
      const dto: CreateEquipmentStockDto = { equipmentId: 999 };
      mockPrisma.equipment.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all equipment stocks', async () => {
      const rows = [
        { id: 1, equipmentId: 1, durability: 100 },
        { id: 2, equipmentId: 2, durability: 50 },
      ];
      mockPrisma.equipmentStock.findMany.mockResolvedValue(rows);

      const res = await service.findAll();

      expect(mockPrisma.equipmentStock.findMany).toHaveBeenCalledWith({
        include: equipmentStockInclude,
      });
      expect(res).toEqual(rows);
    });
  });
  describe('findOne', () => {
    it('should return a single equipment stock if found', async () => {
      const row = { id: 1, equipmentId: 1, durability: 100 };
      mockPrisma.equipmentStock.findUnique.mockResolvedValue(row);

      const res = await service.findOne(1);

      expect(mockPrisma.equipmentStock.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: equipmentStockInclude,
      });
      expect(res).toEqual(row);
    });

    it('should throw NotFoundException if stock not found', async () => {
      mockPrisma.equipmentStock.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
  describe('update', () => {
    it('should update and return the updated row', async () => {
      const dto: UpdateEquipmentStockDto = { durability: 80 };
      const updated = { id: 1, equipmentId: 1, durability: 80 };
      mockPrisma.equipmentStock.update.mockResolvedValue(updated);

      const res = await service.update(1, dto);

      expect(mockPrisma.equipmentStock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
        include: equipmentStockInclude,
      });
      expect(res).toEqual(updated);
    });

    it('should verify equipment if equipmentId is updated', async () => {
      const dto: UpdateEquipmentStockDto = { equipmentId: 2 };
      mockPrisma.equipment.findUnique.mockResolvedValue({ id: 2 });
      const updated = { id: 1, equipmentId: 2, durability: 100 };
      mockPrisma.equipmentStock.update.mockResolvedValue(updated);

      const res = await service.update(1, dto);

      expect(mockPrisma.equipment.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(mockPrisma.equipmentStock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
        include: equipmentStockInclude,
      });
      expect(res).toEqual(updated);
    });

    it('should throw NotFoundException if prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Not found',
        { code: 'P2025', clientVersion: '1.0' } as any,
      );
      mockPrisma.equipmentStock.update.mockRejectedValue(prismaError);

      await expect(service.update(999, { quantity: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should re-throw generic errors', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.equipmentStock.update.mockRejectedValue(error);

      await expect(service.update(1, {})).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete a stock and return it', async () => {
      const deleted = { id: 1, equipmentId: 1, durability: 100 };
      mockPrisma.equipmentStock.delete.mockResolvedValue(deleted);

      const res = await service.delete(1);

      expect(mockPrisma.equipmentStock.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res).toEqual(deleted);
    });

    it('should throw NotFoundException if prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Not found',
        { code: 'P2025', clientVersion: '1.0' } as any,
      );
      mockPrisma.equipmentStock.delete.mockRejectedValue(prismaError);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.equipmentStock.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow(error);
    });
  });

  describe('repair', () => {
    it('should repair stock and set durability to maxDurability', async () => {
      const stock = { id: 1, equipmentId: 1, durability: 20, equipment: { maxDurability: 100 } };
      mockPrisma.equipmentStock.findUnique.mockResolvedValue(stock);
      mockPrisma.equipmentStock.update.mockResolvedValue({
        ...stock,
        durability: 100,
        statusId: 1,
      });

      const res = await service.repair(1);

      expect(mockPrisma.equipmentStock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { durability: 100, statusId: 1 },
        include: equipmentStockInclude,
      });
      expect(res.durability).toBe(100);
    });

    it('should throw NotFoundException if stock not found for repair', async () => {
      mockPrisma.equipmentStock.findUnique.mockResolvedValue(null);

      await expect(service.repair(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated stock', async () => {
      const updated = { id: 1, equipmentId: 1, durability: 100, statusId: 2 };
      mockPrisma.equipmentStock.update.mockResolvedValue(updated);

      const res = await service.updateStatus(1, 2);

      expect(mockPrisma.equipmentStock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { statusId: 2 },
        include: equipmentStockInclude,
      });
      expect(res.statusId).toBe(2);
    });

    it('should throw NotFoundException if prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Not found',
        { code: 'P2025', clientVersion: '1.0' } as any,
      );
      mockPrisma.equipmentStock.update.mockRejectedValue(prismaError);

      await expect(service.updateStatus(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.equipmentStock.update.mockRejectedValue(error);

      await expect(service.updateStatus(1, 1)).rejects.toThrow(error);
    });
  });
});