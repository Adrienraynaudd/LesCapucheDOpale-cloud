import { Test, TestingModule } from '@nestjs/testing';
import { AdventurersController } from '../controllers/adventurers.controller';
import { AdventurersService } from '../services/adventurers.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AdventurersController', () => {
  let controller: AdventurersController;
  let service: AdventurersService;

  const mockAdventurersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@mail.com', roleId: 1 };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: () => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdventurersController],
      providers: [
        { provide: AdventurersService, useValue: mockAdventurersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AdventurersController>(AdventurersController);
    service = module.get<AdventurersService>(AdventurersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create()', async () => {
    const dto = {
      name: 'Aragorn',
      specialityId: 1,
      dailyRate: 100,
      experience: 5,
      equipmentTypes: [
        {
          name: 'Sword',
        },
      ],
      consumableTypes: [
        {
          name: 'Potion',
        },
      ],
    };
    mockAdventurersService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call service.update()', async () => {
    const updated = { id: 1, name: 'Updated' };
    mockAdventurersService.update.mockResolvedValue(updated);

    const result = await controller.update(1, { name: 'Updated' });

    expect(service.update).toHaveBeenCalledWith(1, { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  describe('findAll', () => {
    it('should call service.findAll with empty options when no query params provided', async () => {
      const query = {};
      mockAdventurersService.findAll.mockResolvedValue([]);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({
        name: undefined,
        specialityId: undefined,
        experienceMin: undefined,
        experienceMax: undefined,
        dailyRateOrder: undefined,
      });
    });

    it('should call service.findAll with parsed options and ASC order', async () => {
      const query = {
        name: 'Aria',
        specialityId: '3',
        xpMin: '10',
        xpMax: '50',
        dailyRateOrder: 'asc' as const,
      };
      mockAdventurersService.findAll.mockResolvedValue([]);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({
        name: 'Aria',
        specialityId: 3,
        experienceMin: 10,
        experienceMax: 50,
        dailyRateOrder: 'asc',
      });
    });

    it('should call service.findAll with DESC order', async () => {
      const query = { dailyRateOrder: 'desc' as const };
      mockAdventurersService.findAll.mockResolvedValue([]);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({
        name: undefined,
        specialityId: undefined,
        experienceMin: undefined,
        experienceMax: undefined,
        dailyRateOrder: 'desc',
      });
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct ID', async () => {
      const id = 1;
      const mockAdventurer = { id, name: 'Test' };
      mockAdventurersService.findOne.mockResolvedValue(mockAdventurer);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockAdventurer);
    });
  });
});