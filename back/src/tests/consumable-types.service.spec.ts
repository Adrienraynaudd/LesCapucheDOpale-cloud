import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConsumableTypesService } from '../services/consumable-types.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConsumableTypesService', () => {
    let service: ConsumableTypesService;
    let prisma: PrismaService;

    beforeEach(() => {
        prisma = {
            consumableType: {
                findFirst: jest.fn(),
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        } as any;

        service = new ConsumableTypesService(prisma);
    });

    afterEach(() => jest.clearAllMocks());

    // ------------------------
    // CREATE
    // ------------------------
    it('should create a new consumable type', async () => {
        (prisma.consumableType.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.consumableType.create as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Potion',
        });

        const result = await service.create({ name: 'Potion' });

        expect(result).toEqual({
            id: 1,
            name: 'Potion',
        });
    });

    it('should throw ConflictException if name already exists', async () => {
        (prisma.consumableType.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: 'Potion' });

        await expect(service.create({ name: 'Potion' })).rejects.toThrow(ConflictException);
    });

    // ------------------------
    // FIND ALL
    // ------------------------
    it('should return all consumable types', async () => {
        const types = [{ id: 1, name: 'Elixir' }];
        (prisma.consumableType.findMany as jest.Mock).mockResolvedValue(types);

        const result = await service.findAll();
        expect(result).toEqual(types);
    });

    // ------------------------
    // FIND ONE
    // ------------------------
    it('should return a consumable type by id', async () => {
        const type = { id: 1, name: 'Potion' };
        (prisma.consumableType.findUnique as jest.Mock).mockResolvedValue(type);

        const result = await service.findOne(1);
        expect(result).toEqual(type);
    });

    it('should throw NotFoundException if consumable type not found', async () => {
        (prisma.consumableType.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // UPDATE
    // ------------------------
    it('should update a consumable type', async () => {
        const updated = { id: 1, name: 'Updated' };
        (prisma.consumableType.update as jest.Mock).mockResolvedValue(updated);

        const result = await service.update(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if updating non-existent consumable type', async () => {
        (prisma.consumableType.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // REMOVE
    // ------------------------
    it('should delete a consumable type', async () => {
        (prisma.consumableType.delete as jest.Mock).mockResolvedValue({ id: 1 });

        const result = await service.remove(1);
        expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if deleting non-existent consumable type', async () => {
        (prisma.consumableType.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
});
