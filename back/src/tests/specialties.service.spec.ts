import { ConflictException, NotFoundException } from '@nestjs/common';
import { SpecialtiesService } from '../services/specialties.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SpecialtiesService', () => {
    let service: SpecialtiesService;
    let prisma: PrismaService;

    beforeEach(() => {
        prisma = {
            specialty: {
                findFirst: jest.fn(),
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        } as any;

        service = new SpecialtiesService(prisma);
    });

    afterEach(() => jest.clearAllMocks());

    // ------------------------
    // CREATE
    // ------------------------
    it('should create a new specialty', async () => {
        (prisma.specialty.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.specialty.create as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Warrior',
        });

        const result = await service.create({ name: 'Warrior' });

        expect(result).toEqual({
            id: 1,
            name: 'Warrior',
        });
    });

    it('should throw ConflictException if name already exists', async () => {
        (prisma.specialty.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: 'Warrior' });

        await expect(service.create({ name: 'Warrior' })).rejects.toThrow(ConflictException);
    });

    // ------------------------
    // FIND ALL
    // ------------------------
    it('should return all specialties', async () => {
        const specialties = [{ id: 1, name: 'Mage' }];
        (prisma.specialty.findMany as jest.Mock).mockResolvedValue(specialties);

        const result = await service.findAll();
        expect(result).toEqual(specialties);
    });

    // ------------------------
    // FIND ONE
    // ------------------------
    it('should return a specialty by id', async () => {
        const specialty = { id: 1, name: 'Warrior' };
        (prisma.specialty.findUnique as jest.Mock).mockResolvedValue(specialty);

        const result = await service.findOne(1);
        expect(result).toEqual(specialty);
    });

    it('should throw NotFoundException if specialty not found', async () => {
        (prisma.specialty.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // UPDATE
    // ------------------------
    it('should update a specialty', async () => {
        const updated = { id: 1, name: 'Updated' };
        (prisma.specialty.update as jest.Mock).mockResolvedValue(updated);

        const result = await service.update(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if updating non-existent specialty', async () => {
        (prisma.specialty.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // REMOVE
    // ------------------------
    it('should delete a specialty', async () => {
        (prisma.specialty.delete as jest.Mock).mockResolvedValue({ id: 1 });

        const result = await service.remove(1);
        expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if deleting non-existent specialty', async () => {
        (prisma.specialty.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
});
