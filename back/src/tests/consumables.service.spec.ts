import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConsumablesService } from '../services/consumables.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConsumablesService', () => {
  let service: ConsumablesService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      consumable: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: (fn: any) => fn({ consumable: (prisma as any).consumable }),
    } as unknown as PrismaService;

    service = new ConsumablesService(prisma);
  });

  // CREATE
  it('should create a consumable', async () => {
    const dto = { name: 'Potion', consumableTypeId: 1, quantity: 10, cost: 25 };
    (prisma.consumable.create as jest.Mock).mockResolvedValue({ id: 1, ...dto });

    const res = await service.create(dto as any);
    expect(prisma.consumable.create).toHaveBeenCalledWith({
      data: dto,
      include: { consumableType: true },
    });
    expect(res).toEqual({ id: 1, ...dto });
  });

  // FIND ALL
  it('should return all consumables', async () => {
    (prisma.consumable.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const res = await service.findAll();
    expect(prisma.consumable.findMany).toHaveBeenCalledWith({
      include: { consumableType: true },
    });
    expect(res).toEqual([{ id: 1 }]);
  });

  // FIND ONE
  it('should return a consumable by id', async () => {
    (prisma.consumable.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await service.findOne(1);
    expect(prisma.consumable.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { consumableType: true },
    });
    expect(res).toEqual({ id: 1 });
  });

  it('should throw NotFoundException when consumable not found', async () => {
    (prisma.consumable.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne(42)).rejects.toThrow(NotFoundException);
  });

  // UPDATE
  describe('update', () => {
    it('should update a consumable', async () => {
      (prisma.consumable.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Up' });

      const res = await service.update(1, { name: 'Up' });
      expect(prisma.consumable.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Up' },
        include: { consumableType: true },
      });
      expect(res).toEqual({ id: 1, name: 'Up' });
    });

    it('should map P2025 to NotFound on update', async () => {
      // Simule l'erreur Prisma P2025
      (prisma.consumable.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
      await expect(service.update(999, { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    // TEST AJOUTÉ : Couvre la ligne 47 (Erreur générique)
    it('should re-throw other errors on update', async () => {
      const error = new Error('Database exploded');
      (prisma.consumable.update as jest.Mock).mockRejectedValue(error);
      await expect(service.update(1, { name: 'X' })).rejects.toThrow(error);
    });
  });

  // REMOVE
  describe('remove', () => {
    it('should delete a consumable', async () => {
      (prisma.consumable.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const res = await service.remove(1);
      expect(prisma.consumable.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res).toEqual({ id: 1 });
    });

    it('should map P2025 to NotFound on delete', async () => {
      (prisma.consumable.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
      await expect(service.remove(123)).rejects.toThrow(NotFoundException);
    });

    // TEST AJOUTÉ : Couvre la ligne 61 (P2003 -> BadRequest)
    it('should map P2003 to BadRequestException on delete (FK violation)', async () => {
      (prisma.consumable.delete as jest.Mock).mockRejectedValue({ code: 'P2003' });
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    // TEST AJOUTÉ : Couvre la ligne 68 (Erreur générique)
    it('should re-throw other errors on delete', async () => {
      const error = new Error('Database exploded');
      (prisma.consumable.delete as jest.Mock).mockRejectedValue(error);
      await expect(service.remove(1)).rejects.toThrow(error);
    });
  });

  // PURCHASE
  describe('purchase', () => {
    it('should purchase and decrement stock', async () => {
      (prisma.consumable.findUnique as jest.Mock).mockResolvedValue({ id: 10, quantity: 10 });
      (prisma.consumable.update as jest.Mock).mockResolvedValue({
        id: 10,
        quantity: 7,
        consumableType: { id: 1, name: 'Potion' },
      });

      const res = await service.purchase(10, 3);
      expect(res).toEqual({
        id: 10,
        quantity: 7,
        consumableType: { id: 1, name: 'Potion' },
      });
    });

    it('should throw NotFoundException if consumable does not exist', async () => {
      (prisma.consumable.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.purchase(10, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if not enough stock', async () => {
      (prisma.consumable.findUnique as jest.Mock).mockResolvedValue({ id: 10, quantity: 1 });
      await expect(service.purchase(10, 3)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if qty <= 0', async () => {
      await expect(service.purchase(10, 0)).rejects.toThrow(BadRequestException);
    });
  });
});