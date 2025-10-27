import { ConflictException, NotFoundException } from '@nestjs/common';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EquipmentTypesService', () => {
    let service: EquipmentTypesService;
    let prisma: PrismaService;

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
        } as any;

        service = new EquipmentTypesService(prisma);
    });

    afterEach(() => jest.clearAllMocks());

    // ------------------------
    // CREATE
    // ------------------------
    it('should create a new equipment type', async () => {
        (prisma.equipmentType.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.equipmentType.create as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Sword',
        });

        const result = await service.create({ name: 'Sword' });

        expect(result).toEqual({
            id: 1,
            name: 'Sword',
        });
    });

    it('should throw ConflictException if name already exists', async () => {
        (prisma.equipmentType.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: 'Sword' });

        await expect(service.create({ name: 'Sword' })).rejects.toThrow(ConflictException);
    });

    // ------------------------
    // FIND ALL
    // ------------------------
    it('should return all equipment types', async () => {
        const types = [{ id: 1, name: 'Bow' }];
        (prisma.equipmentType.findMany as jest.Mock).mockResolvedValue(types);

        const result = await service.findAll();
        expect(result).toEqual(types);
    });

    // ------------------------
    // FIND ONE
    // ------------------------
    it('should return an equipment type by id', async () => {
        const type = { id: 1, name: 'Sword' };
        (prisma.equipmentType.findUnique as jest.Mock).mockResolvedValue(type);

        const result = await service.findOne(1);
        expect(result).toEqual(type);
    });

    it('should throw NotFoundException if equipment type not found', async () => {
        (prisma.equipmentType.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // UPDATE
    // ------------------------
    it('should update an equipment type', async () => {
        const updated = { id: 1, name: 'Updated' };
        (prisma.equipmentType.update as jest.Mock).mockResolvedValue(updated);

        const result = await service.update(1, { name: 'Updated' });
        expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if updating non-existent equipment type', async () => {
        (prisma.equipmentType.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
    });

    // ------------------------
    // REMOVE
    // ------------------------
    it('should delete an equipment type', async () => {
        (prisma.equipmentType.delete as jest.Mock).mockResolvedValue({ id: 1 });

        const result = await service.remove(1);
        expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if deleting non-existent equipment type', async () => {
        (prisma.equipmentType.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
        await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
});
