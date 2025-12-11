import { NotFoundException } from '@nestjs/common';
import { StatusesService } from '../services/statuses.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

describe('StatusesService', () => {
  let service: StatusesService;

  type StatusDelegateMock = {
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockStatusDelegate: StatusDelegateMock = {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrisma = {
    status: mockStatusDelegate,
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StatusesService(mockPrisma);
  });

  describe('create', () => {
    it('should create a status', async () => {
      const dto: CreateStatusDto = { name: 'in progress' };
      mockStatusDelegate.create.mockResolvedValue({ id: 1, name: dto.name });

      const res = await service.create(dto);
      expect(mockStatusDelegate.create).toHaveBeenCalledWith({
        data: { name: dto.name },
      });
      expect(res).toEqual({ id: 1, name: dto.name });
    });
  });

  describe('findAll', () => {
    it('should return statuses ordered by id asc', async () => {
      const rows = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ];
      mockStatusDelegate.findMany.mockResolvedValue(rows);

      const res = await service.findAll();
      expect(mockStatusDelegate.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
      expect(res).toEqual(rows);
    });
  });

  describe('update', () => {
    it('should update and return the status', async () => {
      const dto: UpdateStatusDto = { name: 'done' };
      mockStatusDelegate.update.mockResolvedValue({ id: 2, name: 'done' });

      const res = await service.update(2, dto);
      expect(mockStatusDelegate.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: dto,
      });
      expect(res).toEqual({ id: 2, name: 'done' });
    });

    it('should throw NotFoundException when prisma throws P2025', async () => {
      const dto: UpdateStatusDto = { name: 'x' };
      const prismaErr = { code: 'P2025' };
      mockStatusDelegate.update.mockRejectedValue(prismaErr);

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });

    // --- NOUVEAU : Couvre la ligne 25 (throw e) ---
    it('should re-throw other errors', async () => {
      const error = new Error('Database exploded');
      mockStatusDelegate.update.mockRejectedValue(error);

      await expect(service.update(1, { name: 'test' })).rejects.toThrow(error);
    });
    
    // --- NOUVEAU : Couverture de branche pour isPrismaNotFoundError ---
    // Cas où l'erreur n'est pas un objet (ex: string)
    it('should re-throw non-object errors', async () => {
      const error = 'Critical Failure';
      mockStatusDelegate.update.mockRejectedValue(error);
      
      try {
        await service.update(1, { name: 't' });
      } catch (e) {
        expect(e).toBe('Critical Failure');
      }
    });
  });

  describe('delete', () => {
    it('should delete and return result', async () => {
      mockStatusDelegate.delete.mockResolvedValue({ id: 3 });
      const res = await service.delete(3);
      expect(mockStatusDelegate.delete).toHaveBeenCalledWith({
        where: { id: 3 },
      });
      expect(res).toEqual({ id: 3 });
    });

    it('should throw NotFoundException when prisma throws P2025', async () => {
      const prismaErr = { code: 'P2025' };
      mockStatusDelegate.delete.mockRejectedValue(prismaErr);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    // --- NOUVEAU : Couvre la ligne 36 (throw e) ---
    it('should re-throw other errors', async () => {
      const error = new Error('Connection failed');
      mockStatusDelegate.delete.mockRejectedValue(error);

      await expect(service.delete(3)).rejects.toThrow(error);
    });
  });
});