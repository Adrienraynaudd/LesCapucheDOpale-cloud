import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConsumableTypesService } from '../services/consumable-types.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumableTypeDto } from '../dto/create-consumable-type.dto';
import { UpdateConsumableTypeDto } from '../dto/update-consumable-type.dto';
import { Prisma } from '@prisma/client';

describe('ConsumableTypesService', () => {
  let service: ConsumableTypesService;

  // Mock du client Prisma
  let prismaMock: {
    consumableType: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      consumableType: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new ConsumableTypesService(
      prismaMock as unknown as PrismaService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a new consumable type', async () => {
      const dto: CreateConsumableTypeDto = { name: 'Potion' };
      prismaMock.consumableType.findFirst.mockResolvedValue(null);
      prismaMock.consumableType.create.mockResolvedValue({ id: 1, name: 'Potion' });

      const result = await service.create(dto);

      expect(prismaMock.consumableType.findFirst).toHaveBeenCalledWith({ where: { name: dto.name } });
      expect(prismaMock.consumableType.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ id: 1, name: 'Potion' });
    });

    it('should throw ConflictException if name already exists', async () => {
      const dto: CreateConsumableTypeDto = { name: 'Potion' };
      prismaMock.consumableType.findFirst.mockResolvedValue({ id: 1, name: 'Potion' });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all consumable types', async () => {
      const types = [{ id: 1, name: 'Elixir' }];
      prismaMock.consumableType.findMany.mockResolvedValue(types);
      const result = await service.findAll();
      expect(result).toEqual(types);
    });
  });

  describe('findOne', () => {
    it('should return a consumable type by id', async () => {
      const type = { id: 1, name: 'Potion' };
      prismaMock.consumableType.findUnique.mockResolvedValue(type);
      const result = await service.findOne(1);
      expect(result).toEqual(type);
    });

    it('should throw NotFoundException if consumable type not found', async () => {
      prismaMock.consumableType.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a consumable type', async () => {
      const dto: UpdateConsumableTypeDto = { name: 'Updated' };
      const updated = { id: 1, name: 'Updated' };
      prismaMock.consumableType.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(prismaMock.consumableType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if Prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: '1.0.0' } as any,
      );
      prismaMock.consumableType.update.mockRejectedValue(prismaError);

      await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database exploded');
      prismaMock.consumableType.update.mockRejectedValue(unexpectedError);

      await expect(service.update(1, {})).rejects.toThrow(unexpectedError);
    });
  });

  describe('delete', () => {
    it('should delete a consumable type', async () => {
      prismaMock.consumableType.delete.mockResolvedValue({ id: 1 });
      const result = await service.delete(1);
      expect(prismaMock.consumableType.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if Prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to delete not found.',
        { code: 'P2025', clientVersion: '1.0.0' } as any,
      );
      prismaMock.consumableType.delete.mockRejectedValue(prismaError);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database exploded');
      prismaMock.consumableType.delete.mockRejectedValue(unexpectedError);

      await expect(service.delete(1)).rejects.toThrow(unexpectedError);
    });
  });
});