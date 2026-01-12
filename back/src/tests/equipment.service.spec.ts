import { NotFoundException } from '@nestjs/common';
import { EquipmentService } from '../services/equipment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { Equipment, EquipmentType, Prisma } from '@prisma/client';
import { equipmentInclude } from '../dbo/equipment.dbo';

describe('EquipmentService', () => {
  let service: EquipmentService;

  type EquipmentDelegateMock = {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  type EquipmentTypeDelegateMock = {
    findUnique: jest.Mock;
  };

  const mockPrisma = {
    equipment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    equipmentType: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EquipmentService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create equipment when equipmentType exists', async () => {
      const dto: CreateEquipmentDto = {
        name: 'Sword',
        cost: 100,
        maxDurability: 50,
        equipmentTypeId: 1,
      };

      mockPrisma.equipmentType.findUnique.mockResolvedValue({
        id: 1,
        name: 'Weapon',
      } as EquipmentType);

      mockPrisma.equipment.create.mockResolvedValue({
        id: 1,
        ...dto,
        currentDurability: dto.maxDurability,
      } as Equipment);

      const res = await service.create(dto);

      expect(mockPrisma.equipmentType.findUnique).toHaveBeenCalledWith({
        where: { id: dto.equipmentTypeId },
      });

      expect(mockPrisma.equipment.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          cost: dto.cost,
          maxDurability: dto.maxDurability,
          currentDurability: dto.maxDurability,
          equipmentTypeId: dto.equipmentTypeId,
        },
        include: equipmentInclude,
      });

      expect(res).toEqual(expect.objectContaining({ id: 1, name: 'Sword' }));
    });

    it('should throw NotFoundException when equipmentType does not exist', async () => {
      const dto: CreateEquipmentDto = {
        name: 'Axe',
        cost: 80,
        maxDurability: 40,
        equipmentTypeId: 999,
      };

      mockPrisma.equipmentType.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all equipments', async () => {
      const rows: Equipment[] = [
        {
          id: 1,
          name: 'Sword',
          cost: 100,
          maxDurability: 50,
          currentDurability: 50,
          equipmentTypeId: 1,
        } as Equipment,
      ];
      mockPrisma.equipment.findMany.mockResolvedValue(rows);

      const res = await service.findAll();

      expect(mockPrisma.equipment.findMany).toHaveBeenCalledWith({
        include: equipmentInclude,
      });
      expect(res).toEqual(rows);
    });
  });

  describe('findOne', () => {
    it('should return the equipment if found', async () => {
      const equipment: Equipment = {
        id: 1,
        name: 'Sword',
        cost: 100,
        maxDurability: 50,
        currentDurability: 50,
        equipmentTypeId: 1,
      } as Equipment;
      mockPrisma.equipment.findUnique.mockResolvedValue(equipment);

      const res = await service.findOne(1);

      expect(mockPrisma.equipment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: equipmentInclude,
      });
      expect(res).toEqual(equipment);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.equipment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return updated row when valid', async () => {
      const dto: UpdateEquipmentDto = { name: 'Updated', cost: 120 };
      const updated: Equipment = {
        id: 1,
        name: 'Updated',
        cost: 120,
        maxDurability: 50,
        currentDurability: 50,
        equipmentTypeId: 1,
      } as Equipment;

      mockPrisma.equipment.update.mockResolvedValue(updated);

      const res = await service.update(1, dto);

      expect(mockPrisma.equipment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
        include: equipmentInclude,
      });
      expect(res).toEqual(updated);
    });

    it('should verify equipmentType if provided in dto', async () => {
      const dto: UpdateEquipmentDto = { equipmentTypeId: 2 };
      mockPrisma.equipmentType.findUnique.mockResolvedValue({
        id: 2,
        name: 'Armor',
      } as EquipmentType);

      const updated: Equipment = {
        id: 1,
        name: 'Sword',
        cost: 100,
        maxDurability: 50,
        currentDurability: 50,
        equipmentTypeId: 2,
      } as Equipment;
      mockPrisma.equipment.update.mockResolvedValue(updated);

      const res = await service.update(1, dto);

      expect(mockPrisma.equipmentType.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should throw NotFoundException if Prisma throws P2025', async () => {
      const dto: UpdateEquipmentDto = { name: 'x' };
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);

      mockPrisma.equipment.update.mockRejectedValue(prismaError);

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors', async () => {
      const error = new Error('DB Error');
      mockPrisma.equipment.update.mockRejectedValue(error);
      await expect(service.update(1, {})).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete and return result', async () => {
      const deleted: Equipment = {
        id: 1,
        name: 'Sword',
        cost: 100,
        maxDurability: 50,
        currentDurability: 50,
        equipmentTypeId: 1,
      } as Equipment;
      mockPrisma.equipment.delete.mockResolvedValue(deleted);

      const res = await service.delete(1);

      expect(mockPrisma.equipment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res).toEqual(deleted);
    });

    it('should throw NotFoundException if Prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);

      mockPrisma.equipment.delete.mockRejectedValue(prismaError);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw generic errors', async () => {
      const error = new Error('DB Error');
      mockPrisma.equipment.delete.mockRejectedValue(error);
      await expect(service.delete(1)).rejects.toThrow(error);
    });
  });
});