import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../services/roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// On crée un Mock pour Prisma
const mockPrismaService = {
  role: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const result = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
      ];
      
      // On simule le retour de Prisma
      (prisma.role.findMany as jest.Mock).mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prisma.role.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single role if found', async () => {
      const result = { id: 1, name: 'Admin' };
      
      // On simule un succès
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if role is not found', async () => {
      // On simule un retour null (rôle inexistant)
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Role not found');
    });
  });
});