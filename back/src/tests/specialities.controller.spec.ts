import { Test, TestingModule } from '@nestjs/testing';
import { SpecialitiesController } from '../controllers/specialities.controller';
import { SpecialitiesService } from '../services/specialities.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('SpecialitiesController', () => {
  let controller: SpecialitiesController;

  const mockSpecialitiesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  } = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  interface RequestWithUser {
    user: { id: number; email: string; roleId: number };
    [key: string]: unknown;
  }

  const mockJwtAuthGuard = {
    canActivate(this: void, context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<RequestWithUser>();
      req.user = { id: 1, email: 'admin@mail.com', roleId: 1 };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate(this: void) {
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialitiesController],
      providers: [
        { provide: SpecialitiesService, useValue: mockSpecialitiesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<SpecialitiesController>(SpecialitiesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create()', async () => {
    const dto = { name: 'Warrior' };
    mockSpecialitiesService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto);

    expect(mockSpecialitiesService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call service.findAll()', async () => {
    const specialities = [{ id: 1, name: 'Mage' }];
    mockSpecialitiesService.findAll.mockResolvedValue(specialities);

    const result = await controller.findAll();

    expect(mockSpecialitiesService.findAll).toHaveBeenCalled();
    expect(result).toEqual(specialities);
  });

  it('should call service.findOne()', async () => {
    const speciality = { id: 1, name: 'Warrior' };
    mockSpecialitiesService.findOne.mockResolvedValue(speciality);

    const result = await controller.findOne(1);

    expect(mockSpecialitiesService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(speciality);
  });

  it('should call service.update()', async () => {
    const updated = { id: 1, name: 'Updated' };
    mockSpecialitiesService.update.mockResolvedValue(updated);

    const result = await controller.update(1, { name: 'Updated' });

    expect(mockSpecialitiesService.update).toHaveBeenCalledWith(1, {
      name: 'Updated',
    });
    expect(result).toEqual(updated);
  });

  it('should call service.remove()', async () => {
    const deleted = { id: 1 };
    mockSpecialitiesService.delete.mockResolvedValue(deleted);

    const result = await controller.remove(1);

    expect(mockSpecialitiesService.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual(deleted);
  });
});
