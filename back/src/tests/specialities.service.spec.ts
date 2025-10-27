import { ConflictException, NotFoundException } from '@nestjs/common';
import { SpecialitiesService } from '../services/specialities.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SpecialitiesService', () => {
    let service: SpecialitiesService;
    let prisma: PrismaService;

    beforeEach(() => {
        prisma = {
            speciality: {
                findFirst: jest.fn(),
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        } as any;

        service = new SpecialitiesService(prisma);
    });

    afterEach(() => jest.clearAllMocks());

    // ------------------------
    // CREATE
    // ------------------------
    it('should create a new speciality', async () => {
        (prisma.speciality.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.speciality.create as jest.Mock).mockResolvedValue({
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
        (prisma.speciality.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: 'Warrior' });

        await expect(service.create({ name: 'Warrior' })).rejects.toThrow(ConflictException);
    });

    // ------------------------
    // FIND ALL
    // ------------------------
    it('should return all specialities', async () => {
        const specialities = [{ id: 1, name: 'Mage' }];
        (prisma.speciality.findMany as jest.Mock).mockResolvedValue(specialities);

        const result = await service.findAll();
        expect(result).toEqual(specialities);
    });

    // ------------------------
    // FIND ONE
    // ------------------------
    it('should return a speciality by id', async () => {
        const speciality = { id: 1, name: 'Warrior' };
        (prisma.speciality.findUnique as jest.Mock).mockResolvedValue(speciality);

        const result = await service.findOne(1);
        expect(result).toEqual(speciality);
    });

    it('should throw NotFoundException if speciality not found', async () => {
        (prisma.speciality.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // UPDATE
    // ------------------------
    it('should update a speciality', async () => {
        const updated = { id: 1, name: 'Updated' };
        (prisma.speciality.update as jest.Mock).mockResolvedValue(updated);

        const result = await service.update(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if updating non-existent speciality', async () => {
        (prisma.speciality.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // REMOVE
    // ------------------------
    it('should delete a speciality', async () => {
        (prisma.speciality.delete as jest.Mock).mockResolvedValue({ id: 1 });

        const result = await service.remove(1);
        expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if deleting non-existent speciality', async () => {
        (prisma.speciality.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
});
