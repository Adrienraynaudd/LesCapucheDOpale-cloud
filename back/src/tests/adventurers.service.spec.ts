import { NotFoundException } from '@nestjs/common';
import { AdventurersService } from '../services/adventurers.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { adventurerInclude } from '../dbo/adventurer.dbo';

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
  // DBO
  // ------------------------
  it('should have adventurerInclude constant defined', () => {
    expect(adventurerInclude).toBeDefined();
    expect(adventurerInclude.speciality).toBe(true);
    expect(adventurerInclude.equipmentTypes).toBe(true);
    expect(adventurerInclude.consumableTypes).toBe(true);
  });

  // ------------------------
  // FIND ALL
  // ------------------------
  it('should return an array of adventurers', async () => {
    const adventurersList = [
      { id: 1, name: 'Aragorn' },
      { id: 2, name: 'Legolas' },
    ];
    (prisma.adventurer.findMany as jest.Mock).mockResolvedValue(adventurersList);

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

  it('should call findAll with relations included', async () => {
    (prisma.adventurer.findMany as jest.Mock).mockResolvedValue([]);
    await service.findAll();

    expect(prisma.adventurer.findMany).toHaveBeenCalledWith({
      include: {
        speciality: true,
        equipmentTypes: true,
        consumableTypes: true,
      },
    });
  });

  // ------------------------
  // FIND ONE
  // ------------------------
  it('should return a single adventurer', async () => {
    const adventurer = { id: 1, name: 'Aragorn' };
    (prisma.adventurer.findUnique as jest.Mock).mockResolvedValue(adventurer);

    const result = await service.findOne(1);

    expect(result).toEqual(adventurer);
    expect(prisma.adventurer.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      }),
    );
  });

  it('should throw NotFoundException if adventurer is not found', async () => {
    (prisma.adventurer.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    expect(prisma.adventurer.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 999 },
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      }),
    );
  });

  // ------------------------
  // CREATE
  // ------------------------
  it('should create a new adventurer', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
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

    expect(prisma.adventurer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Aragorn',
          specialityId: 1,
          dailyRate: 100,
          experience: 0,
          equipmentTypes: { connect: [{ id: 1 }] },
          consumableTypes: { connect: [{ id: 1 }] },
        }),
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      }),
    );
  });

  it('should create without relations when arrays are empty', async () => {
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
          dailyRate: 200,
          experience: 0,
          equipmentTypes: undefined,
          consumableTypes: undefined,
        }),
        include: expect.any(Object),
      }),
    );
  });

  it('should set default experience to 0 on create', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 10 });
    (prisma.adventurer.create as jest.Mock).mockResolvedValue({ id: 123 });

    await service.create({
      name: 'Frodo',
      specialityId: 10,
      dailyRate: 50,
      equipmentTypeIds: [],
      consumableTypeIds: [],
    });

    expect(prisma.adventurer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ experience: 0 }),
      }),
    );
  });

  it('should throw NotFoundException if speciality not found', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue(null);

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
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);

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

    expect(prisma.adventurer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          equipmentTypes: { connect: [{ id: 1 }] },
          consumableTypes: undefined,
        }),
      }),
    );
  });

  it('should create with consumable types only', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.adventurer.create as jest.Mock).mockResolvedValue({ id: 1 });

    await service.create({
      name: 'Test',
      specialityId: 1,
      dailyRate: 100,
      equipmentTypeIds: [],
      consumableTypeIds: [1],
    });

    expect(prisma.adventurer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          equipmentTypes: undefined,
          consumableTypes: { connect: [{ id: 1 }] },
        }),
      }),
    );
  });

  it('should create and connect multiple relations', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 3 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([{ id: 3 }]);
    (prisma.adventurer.create as jest.Mock).mockResolvedValue({ id: 42 });

    await service.create({
      name: 'Sam',
      specialityId: 3,
      dailyRate: 70,
      equipmentTypeIds: [1, 2],
      consumableTypeIds: [3],
    });

    expect(prisma.adventurer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          equipmentTypes: { connect: [{ id: 1 }, { id: 2 }] },
          consumableTypes: { connect: [{ id: 3 }] },
        }),
      }),
    );
  });

  // ------------------------
  // UPDATE
  // ------------------------
  it('should update an adventurer', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const updated = { id: 1, name: 'Updated' };
    (prisma.adventurer.update as jest.Mock).mockResolvedValue(updated);

    const result = await service.update(1, { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException if speciality not found on update', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.update(1, { specialityId: 999 })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if an equipment type is not found on update', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([]);

    await expect(service.update(1, { equipmentTypeIds: [999] })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if a consumable type is not found on update', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([]);

    await expect(service.update(1, { consumableTypeIds: [999] })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if updating non-existent adventurer', async () => {
    (prisma.adventurer.update as jest.Mock).mockRejectedValue(new NotFoundException('Record not found'));

    await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
  });

  it('should update speciality only', async () => {
    (prisma.speciality.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
    (prisma.adventurer.update as jest.Mock).mockResolvedValue({ id: 1 });

    await service.update(1, { specialityId: 2 });

    expect(prisma.adventurer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ specialityId: 2 }),
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
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
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      }),
    );
  });

  it('should update consumable types only', async () => {
    (prisma.consumableType.findMany as jest.Mock).mockResolvedValue([{ id: 2 }]);
    (prisma.adventurer.update as jest.Mock).mockResolvedValue({ id: 1 });

    await service.update(1, { consumableTypeIds: [2] });

    expect(prisma.adventurer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          consumableTypes: { set: [{ id: 2 }] },
        }),
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      }),
    );
  });

  it('should update only scalar fields and include relations in response', async () => {
    (prisma.adventurer.update as jest.Mock).mockResolvedValue({ id: 5, name: 'Boromir', dailyRate: 150 });

    await service.update(5, { name: 'Boromir', dailyRate: 150 });

    expect(prisma.adventurer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5 },
        data: expect.objectContaining({ name: 'Boromir', dailyRate: 150 }),
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      }),
    );
  });

  it('should clear relations when updating with empty arrays', async () => {
    (prisma.adventurer.update as jest.Mock).mockResolvedValue({ id: 10 });

    await service.update(10, { equipmentTypeIds: [], consumableTypeIds: [] });

    expect(prisma.equipmentType.findMany).not.toHaveBeenCalled();
    expect(prisma.consumableType.findMany).not.toHaveBeenCalled();

    expect(prisma.adventurer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          equipmentTypes: { set: [] },
          consumableTypes: { set: [] },
        }),
        include: {
          speciality: true,
          equipmentTypes: true,
          consumableTypes: true,
        },
      }),
    );
  });
});