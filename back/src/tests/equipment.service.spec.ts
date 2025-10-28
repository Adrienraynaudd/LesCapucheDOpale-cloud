import { NotFoundException } from '@nestjs/common';
import { EquipmentService } from '../services/equipment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { Equipment, EquipmentType, Prisma } from '@prisma/client';
import { equipmentInclude } from '../dto/equipment.dto';

describe('EquipmentService', () => {
  let service: EquipmentService;

  // --- Types pour les mocks ---
  type EquipmentDelegateMock = {
    create: jest.Mock<Promise<Equipment>, [Prisma.EquipmentCreateArgs]>;
    findMany: jest.Mock<Promise<Equipment[]>, [Prisma.EquipmentFindManyArgs?]>;
    findUnique: jest.Mock<
      Promise<Equipment | null>,
      [Prisma.EquipmentFindUniqueArgs]
    >;
    update: jest.Mock<Promise<Equipment>, [Prisma.EquipmentUpdateArgs]>;
    delete: jest.Mock<Promise<Equipment>, [Prisma.EquipmentDeleteArgs]>;
  };

  type EquipmentTypeDelegateMock = {
    findUnique: jest.Mock<
      Promise<EquipmentType | null>,
      [Prisma.EquipmentTypeFindUniqueArgs]
    >;
  };

  // --- Mock Prisma minimal ---
  const mockPrisma: {
    equipment: EquipmentDelegateMock;
    equipmentType: EquipmentTypeDelegateMock;
  } = {
    equipment: {
      create: jest.fn<Promise<Equipment>, [Prisma.EquipmentCreateArgs]>(),
      findMany: jest.fn<
        Promise<Equipment[]>,
        [Prisma.EquipmentFindManyArgs?]
      >(),
      findUnique: jest.fn<
        Promise<Equipment | null>,
        [Prisma.EquipmentFindUniqueArgs]
      >(),
      update: jest.fn<Promise<Equipment>, [Prisma.EquipmentUpdateArgs]>(),
      delete: jest.fn<Promise<Equipment>, [Prisma.EquipmentDeleteArgs]>(),
    },
    equipmentType: {
      findUnique: jest.fn<
        Promise<EquipmentType | null>,
        [Prisma.EquipmentTypeFindUniqueArgs]
      >(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EquipmentService(mockPrisma as unknown as PrismaService);
  });

  // --- Tests create ---
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
        include: equipmentInclude as Prisma.EquipmentInclude,
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

  // --- Tests findAll ---
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
        {
          id: 2,
          name: 'Axe',
          cost: 80,
          maxDurability: 40,
          currentDurability: 40,
          equipmentTypeId: 2,
        } as Equipment,
      ];
      mockPrisma.equipment.findMany.mockResolvedValue(rows);

      const res = await service.findAll();

      expect(mockPrisma.equipment.findMany).toHaveBeenCalledWith({
        include: equipmentInclude as Prisma.EquipmentInclude,
      });
      expect(res).toEqual(rows);
    });
  });

  // --- Tests findOne ---
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
        include: equipmentInclude as Prisma.EquipmentInclude,
      });
      expect(res).toEqual(equipment);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.equipment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Tests update ---
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
        include: equipmentInclude as Prisma.EquipmentInclude,
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

    it('should throw NotFoundException when updating non-existent equipment', async () => {
      const dto: UpdateEquipmentDto = { name: 'x' };
      mockPrisma.equipment.update.mockRejectedValue(
        new NotFoundException('Equipment not found'),
      );

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Tests delete ---
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

    it('should throw NotFoundException when deleting non-existent equipment', async () => {
      mockPrisma.equipment.delete.mockRejectedValue(
        new NotFoundException('Equipment not found'),
      );

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
