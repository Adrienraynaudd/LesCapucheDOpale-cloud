import { Test, TestingModule } from '@nestjs/testing';
import { ConsumableTypesController } from '../controllers/consumable-types.controller';
import { ConsumableTypesService } from '../services/consumable-types.service';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

interface MockRequest {
  user?: { id: number; email: string; roleId: number };
}

describe('ConsumableTypesController', () => {
  let controller: ConsumableTypesController;
  let service: ConsumableTypesService;

  const mockConsumableTypesService: Partial<ConsumableTypesService> = {
    create: jest.fn((dto: { name: string }) =>
      Promise.resolve({ id: 1, ...dto }),
    ),
    findAll: jest.fn(() => Promise.resolve([{ id: 1, name: 'Elixir' }])),
    findOne: jest.fn((id: number) => Promise.resolve({ id, name: 'Potion' })),
    update: jest.fn((id: number, dto: { name: string }) =>
      Promise.resolve({ id, ...dto }),
    ),
    delete: jest.fn((id: number) => Promise.resolve({ id, name: 'Potion' })),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest<MockRequest>();
      req.user = { id: 1, email: 'admin@mail.com', roleId: 1 };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: () => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumableTypesController],
      providers: [
        {
          provide: ConsumableTypesService,
          useValue: mockConsumableTypesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ConsumableTypesController>(
      ConsumableTypesController,
    );

    service = module.get<ConsumableTypesService>(ConsumableTypesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create()', async () => {
    const dto = { name: 'Potion' };

    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call service.findAll()', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, name: 'Elixir' }]);
  });

  it('should call service.findOne()', async () => {
    const result = await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, name: 'Potion' });
  });

  it('should call service.update()', async () => {
    const dto = { name: 'Updated' };

    const result = await controller.update(1, dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call service.delete()', async () => {
    const result = await controller.delete(1);
    expect(service.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, name: 'Potion' });
  });
});
