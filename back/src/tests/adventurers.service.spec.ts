import {  NotFoundException } from '@nestjs/common';
import { AdventurersService } from '../services/adventurers.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('AdventurersService', () => {
  let service: AdventurersService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      adventurer: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      speciality: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      equipmentType: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      consumableType: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    } as any;

    service = new AdventurersService(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  // ------------------------
  // FIND ALL
  // ------------------------
  it('should return an array of adventurers', async () => {
    const adventurersList = [
      { id: 1, name: 'Aragorn' },
      { id: 2, name: 'Legolas' },
    ];
    (prisma.adventurer.findMany as jest.Mock).mockResolvedValue(
      adventurersList,
    );

    const result = await service.findAll();

    expect(result).toEqual(adventurersList);
    expect(prisma.adventurer.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array when no adventurers are found', async () => {
    (prisma.adventurer.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
    expect(prisma.adventurer.findMany).toHaveBeenCalledTimes(1);
  });

  // ------------------------
  // FIND ONE
  // ------------------------
  it('should return a single adventurer', async () => {
    const adventurer = { id: 1, name: 'Aragorn' };
    (prisma.adventurer.findUnique as jest.Mock).mockResolvedValue(adventurer);

    const result = await service.findOne(1);

    expect(result).toEqual(adventurer);
    expect(prisma.adventurer.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException if adventurer is not found', async () => {
    (prisma.adventurer.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    expect(prisma.adventurer.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });

  // ------------------------
  // CREATE
  // ------------------------
  it('should create a new adventurer', async () => {
    (prisma.adventurer.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([
      { id: 1 },
    ]);
    (prisma.adventurer.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Aragorn',
      speciality: { id: 1, name: 'Warrior' },
      equipmentTypes: [{ id: 1, name: 'Sword' }],
      consumableTypes: [{ id: 1, name: 'Potion' }],
    });

    const result = await service.create({
      name: 'Aragorn',
      specialityId: 1,
      dailyRate: 100,
      equipmentTypeIds: [1],
      consumableTypeIds: [1],
    });

    expect(result).toEqual({
      id: 1,
      name: 'Aragorn',
      speciality: { id: 1, name: 'Warrior' },
      equipmentTypes: [{ id: 1, name: 'Sword' }],
      consumableTypes: [{ id: 1, name: 'Potion' }],
    });
  });

  it('should create without relations when arrays are empty', async () => {
    (prisma.adventurer.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
    (prisma.adventurer.create as jest.Mock).mockResolvedValue({
      id: 2,
      name: 'Gandalf',
      speciality: { id: 2, name: 'Mage' },
      equipmentTypes: [],
      consumableTypes: [],
    });

    await service.create({
      name: 'Gandalf',
      specialityId: 2,
      dailyRate: 200,
      equipmentTypeIds: [],
      consumableTypeIds: [],
    });

    expect(prisma.adventurer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Gandalf',
          specialityId: 2,
          equipmentTypes: undefined,
          consumableTypes: undefined,
        }),
        include: expect.any(Object),
      }),
    );
  });

  it('should throw NotFoundException if speciality not found', async () => {
    (prisma.adventurer.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.speciality.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Aragorn',
        specialityId: 999,
        dailyRate: 100,
        equipmentTypeIds: [],
        consumableTypeIds: [],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if some equipment types are not found', async () => {
    (prisma.adventurer.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([]);

    await expect(
      service.create({
        name: 'Test',
        specialityId: 1,
        dailyRate: 100,
        equipmentTypeIds: [1, 999],
        consumableTypeIds: [],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if some consumable types are not found', async () => {
    (prisma.adventurer.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([
      { id: 1 },
    ]);

    await expect(
      service.create({
        name: 'Test',
        specialityId: 1,
        dailyRate: 100,
        equipmentTypeIds: [],
        consumableTypeIds: [1, 999],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create with equipment types only', async () => {
    (prisma.adventurer.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.adventurer.create as jest.Mock).mockResolvedValue({ id: 1 });

    await service.create({
      name: 'Test',
      specialityId: 1,
      dailyRate: 100,
      equipmentTypeIds: [1],
      consumableTypeIds: [],
    });

    expect(prisma.adventurer.create).toHaveBeenCalled();
  });

  it('should create with consumable types only', async () => {
    (prisma.adventurer.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([
      { id: 1 },
    ]);
    (prisma.adventurer.create as jest.Mock).mockResolvedValue({ id: 1 });

    await service.create({
      name: 'Test',
      specialityId: 1,
      dailyRate: 100,
      equipmentTypeIds: [],
      consumableTypeIds: [1],
    });

    expect(prisma.adventurer.create).toHaveBeenCalled();
  });

  // ------------------------
  // UPDATE
  // ------------------------
  it('should update an adventurer', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([
      { id: 1 },
    ]);
    const updated = { id: 1, name: 'Updated' };
    (prisma.adventurer.update as jest.Mock).mockResolvedValue(updated);

    const result = await service.update(1, { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException if speciality not found on update', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.update(1, { specialityId: 999 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if an equipment type is not found on update', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([]);

    await expect(
      service.update(1, { equipmentTypeIds: [999] }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if a consumable type is not found on update', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([]);

    await expect(
      service.update(1, { consumableTypeIds: [999] }),
    ).rejects.toThrow(NotFoundException);
  });

it('should throw NotFoundException if updating non-existent adventurer', async () => {
  (prisma.adventurer.update as jest.Mock).mockRejectedValue(
    new NotFoundException('Record not found'),
  );

  await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(
    NotFoundException,
  );
});


  it('should update speciality only', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
    (prisma.adventurer.update as jest.Mock).mockResolvedValue({ id: 1 });

    await service.update(1, { specialityId: 2 });

    expect(prisma.adventurer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ specialityId: 2 }),
      }),
    );
  });

  it('should update equipment types only', async () => {
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 2 }]);
    (prisma.adventurer.update as jest.Mock).mockResolvedValue({ id: 1 });

    await service.update(1, { equipmentTypeIds: [2] });

    expect(prisma.adventurer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          equipmentTypes: { set: [{ id: 2 }] },
        }),
      }),
    );
  });

  it('should update consumable types only', async () => {
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([
      { id: 2 },
    ]);
    (prisma.adventurer.update as jest.Mock).mockResolvedValue({ id: 1 });

    await service.update(1, { consumableTypeIds: [2] });

    expect(prisma.adventurer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          consumableTypes: { set: [{ id: 2 }] },
        }),
      }),
    );
  });
});