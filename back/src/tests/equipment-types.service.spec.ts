import { ConflictException, NotFoundException } from '@nestjs/common';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EquipmentType } from '@prisma/client';

describe('EquipmentTypesService', () => {
  let service: EquipmentTypesService;
  let prisma: PrismaServiceMock;

  // --- Types pour le mock ---
  type EquipmentTypeDelegateMock = {
    findFirst: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  type PrismaServiceMock = {
    equipmentType: EquipmentTypeDelegateMock;
  };

  // --- Setup ---
  beforeEach(() => {
    prisma = {
      equipmentType: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new EquipmentTypesService(prisma as unknown as PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ------------------------
  // CREATE
  // ------------------------
  describe('create', () => {
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
  });

  // ------------------------
  // FIND ALL
  // ------------------------
  describe('findAll', () => {
    it('should return all equipment types', async () => {
      const types: EquipmentType[] = [{ id: 1, name: 'Bow' }];
      prisma.equipmentType.findMany.mockResolvedValue(types);

      const result = await service.findAll();
      expect(result).toEqual(types);
    });
  });

  // ------------------------
  // FIND ONE
  // ------------------------
  describe('findOne', () => {
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
  });

  // ------------------------
  // UPDATE
  // ------------------------
  describe('update', () => {
    it('should update an equipment type', async () => {
      const updated: EquipmentType = { id: 1, name: 'Updated' };
      prisma.equipmentType.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Updated' });
      expect(result).toEqual(updated);
    });

    // CORRECTION ICI : Simulation de l'erreur Prisma P2025
    it('should throw NotFoundException if Prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);
      
      prisma.equipmentType.update.mockRejectedValue(prismaError);

      await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      );
    });

    // AJOUT : Test pour les erreurs inattendues (couvre le "throw e")
    it('should re-throw generic errors', async () => {
      const error = new Error('Database disconnected');
      prisma.equipmentType.update.mockRejectedValue(error);

      await expect(service.update(1, { name: 'A' })).rejects.toThrow(error);
    });
  });

  // ------------------------
  // DELETE
  // ------------------------
  describe('delete', () => {
    it('should delete an equipment type', async () => {
      prisma.equipmentType.delete.mockResolvedValue({ id: 1 } as EquipmentType);

      const result = await service.delete(1);
      expect(result).toEqual({ id: 1 });
    });

    // CORRECTION ICI : Simulation de l'erreur Prisma P2025
    it('should throw NotFoundException if Prisma throws P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '1.0',
      } as any);

      prisma.equipmentType.delete.mockRejectedValue(prismaError);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    // AJOUT : Test pour les erreurs inattendues (couvre le "throw e")
    it('should re-throw generic errors', async () => {
      const error = new Error('Database disconnected');
      prisma.equipmentType.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow(error);
    });
  });
});