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
});
