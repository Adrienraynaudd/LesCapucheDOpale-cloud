import { ConflictException, NotFoundException } from '@nestjs/common';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EquipmentType } from '@prisma/client';

describe('EquipmentTypesService', () => {
  let service: EquipmentTypesService;
  let prisma: PrismaServiceMock;

  // --- Types pour le mock ---
  type EquipmentTypeDelegateMock = {
    findFirst: jest.Mock<
      Promise<EquipmentType | null>,
      [Prisma.EquipmentTypeFindFirstArgs]
    >;
    create: jest.Mock<Promise<EquipmentType>, [Prisma.EquipmentTypeCreateArgs]>;
    findMany: jest.Mock<
      Promise<EquipmentType[]>,
      [Prisma.EquipmentTypeFindManyArgs?]
    >;
    findUnique: jest.Mock<
      Promise<EquipmentType | null>,
      [Prisma.EquipmentTypeFindUniqueArgs]
    >;
    update: jest.Mock<Promise<EquipmentType>, [Prisma.EquipmentTypeUpdateArgs]>;
    delete: jest.Mock<Promise<EquipmentType>, [Prisma.EquipmentTypeDeleteArgs]>;
  };

  type PrismaServiceMock = {
    equipmentType: EquipmentTypeDelegateMock;
  };

  // --- Setup ---
  beforeEach(() => {
    prisma = {
      equipmentType: {
        findFirst: jest.fn<
          Promise<EquipmentType | null>,
          [Prisma.EquipmentTypeFindFirstArgs]
        >(),
        create: jest.fn<
          Promise<EquipmentType>,
          [Prisma.EquipmentTypeCreateArgs]
        >(),
        findMany: jest.fn<
          Promise<EquipmentType[]>,
          [Prisma.EquipmentTypeFindManyArgs?]
        >(),
        findUnique: jest.fn<
          Promise<EquipmentType | null>,
          [Prisma.EquipmentTypeFindUniqueArgs]
        >(),
        update: jest.fn<
          Promise<EquipmentType>,
          [Prisma.EquipmentTypeUpdateArgs]
        >(),
        delete: jest.fn<
          Promise<EquipmentType>,
          [Prisma.EquipmentTypeDeleteArgs]
        >(),
      },
    };

    service = new EquipmentTypesService(prisma as unknown as PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ------------------------
  // CREATE
  // ------------------------
  it('should create a new equipment type', async () => {
    prisma.equipmentType.findFirst.mockResolvedValue(null);
    prisma.equipmentType.create.mockResolvedValue({ id: 1, name: 'Sword' });

    const result = await service.create({ name: 'Sword' });

    expect(result).toEqual({ id: 1, name: 'Sword' });
  });

  it('should throw ConflictException if name already exists', async () => {
    prisma.equipmentType.findFirst.mockResolvedValue({ id: 1, name: 'Sword' });

    await expect(service.create({ name: 'Sword' })).rejects.toThrow(
      ConflictException,
    );
  });

  // ------------------------
  // FIND ALL
  // ------------------------
  it('should return all equipment types', async () => {
    const types: EquipmentType[] = [{ id: 1, name: 'Bow' }];
    prisma.equipmentType.findMany.mockResolvedValue(types);

    const result = await service.findAll();
    expect(result).toEqual(types);
  });

  // ------------------------
  // FIND ONE
  // ------------------------
  it('should return an equipment type by id', async () => {
    const type: EquipmentType = { id: 1, name: 'Sword' };
    prisma.equipmentType.findUnique.mockResolvedValue(type);

    const result = await service.findOne(1);
    expect(result).toEqual(type);
  });

  it('should throw NotFoundException if equipment type not found', async () => {
    prisma.equipmentType.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // ------------------------
  // UPDATE
  // ------------------------
  it('should update an equipment type', async () => {
    const updated: EquipmentType = { id: 1, name: 'Updated' };
    prisma.equipmentType.update.mockResolvedValue(updated);

    const result = await service.update(1, { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException if updating non-existent equipment type', async () => {
      prisma.equipmentType.update.mockRejectedValue(
        new NotFoundException('Equipment type not found'),
      );

      await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      );
    });

  // ------------------------
  // DELETE
  // ------------------------
  it('should delete an equipment type', async () => {
    prisma.equipmentType.delete.mockResolvedValue({ id: 1 } as EquipmentType);

    const result = await service.delete(1);
    expect(result).toEqual({ id: 1 });
  });

  it('should throw NotFoundException if deleting non-existent equipment type', async () => {
    prisma.equipmentType.delete.mockRejectedValue(
      new NotFoundException('Equipment type not found'),
    );

    await expect(service.delete(999)).rejects.toThrow(NotFoundException);
  });
});
