import { ConflictException, NotFoundException } from '@nestjs/common';
import { SpecialitiesService } from '../services/specialities.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// --- Classe mock pour simuler PrismaClientKnownRequestError ---
class PrismaClientKnownRequestErrorMock extends Error {
  code: string;
  constructor(code: string) {
    super('Prisma error');
    this.code = code;
  }
}

describe('SpecialitiesService', () => {
  let service: SpecialitiesService;

  type SpecialityDelegateMock = {
    findFirst: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockSpecialityDelegate: SpecialityDelegateMock = {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrisma = {
    speciality: mockSpecialityDelegate,
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SpecialitiesService(mockPrisma);
  });

  afterEach(() => jest.clearAllMocks());

  // ------------------------ CREATE ------------------------
  it('should create a new speciality', async () => {
    mockSpecialityDelegate.findFirst.mockResolvedValue(null);
    mockSpecialityDelegate.create.mockResolvedValue({ id: 1, name: 'Warrior' });

    const result = await service.create({ name: 'Warrior' });

    expect(result).toEqual({ id: 1, name: 'Warrior' });
  });

  it('should throw ConflictException if name already exists', async () => {
    mockSpecialityDelegate.findFirst.mockResolvedValue({ id: 1, name: 'Warrior' });

    await expect(service.create({ name: 'Warrior' })).rejects.toThrow(ConflictException);
  });

  // ------------------------ FIND ALL ------------------------
  it('should return all specialities', async () => {
    const specialities = [{ id: 1, name: 'Mage' }];
    mockSpecialityDelegate.findMany.mockResolvedValue(specialities);

    const result = await service.findAll();
    expect(result).toEqual(specialities);
  });

  // ------------------------ FIND ONE ------------------------
  it('should return a speciality by id', async () => {
    const speciality = { id: 1, name: 'Warrior' };
    mockSpecialityDelegate.findUnique.mockResolvedValue(speciality);

    const result = await service.findOne(1);
    expect(result).toEqual(speciality);
  });

  it('should throw NotFoundException if speciality not found', async () => {
    mockSpecialityDelegate.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // ------------------------ UPDATE ------------------------
  it('should update a speciality', async () => {
    const updated = { id: 1, name: 'Updated' };
    mockSpecialityDelegate.update.mockResolvedValue(updated);

    const result = await service.update(1, { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException on update if Prisma returns P2025', async () => {
  const error = new Prisma.PrismaClientKnownRequestError('Test', {
  clientVersion: '4.0.0',
  code: 'P2025',
});
mockSpecialityDelegate.update.mockRejectedValue(error);

  await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
});

  // ------------------------ DELETE ------------------------
  it('should delete a speciality', async () => {
    mockSpecialityDelegate.delete.mockResolvedValue({ id: 1 });

    const result = await service.delete(1);
    expect(result).toEqual({ id: 1 });
  });

 it('should throw NotFoundException on delete if Prisma returns P2025', async () => {
  const error = new Prisma.PrismaClientKnownRequestError('Test', {
    clientVersion: '4.0.0',
    code: 'P2025',
  });
  mockSpecialityDelegate.delete.mockRejectedValue(error);

  await expect(service.delete(999)).rejects.toThrow(NotFoundException);
});
});
