import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentTypesController } from '../controllers/equipment-types.controller';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

describe('EquipmentTypesController', () => {
  let controller: EquipmentTypesController;

  const mockEquipmentTypesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext): boolean => {
      const req = context.switchToHttp().getRequest<Request & { user: any }>();
      req.user = { id: 1, email: 'admin@mail.com', roleId: 1 };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: (): boolean => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentTypesController],
      providers: [
        { provide: EquipmentTypesService, useValue: mockEquipmentTypesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<EquipmentTypesController>(EquipmentTypesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create()', async () => {
    const dto = { name: 'Sword' };
    mockEquipmentTypesService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto);

    expect(mockEquipmentTypesService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call service.findAll()', async () => {
    const types = [{ id: 1, name: 'Bow' }];
    mockEquipmentTypesService.findAll.mockResolvedValue(types);

    const result = await controller.findAll();

    expect(mockEquipmentTypesService.findAll).toHaveBeenCalled();
    expect(result).toEqual(types);
  });

  it('should call service.findOne()', async () => {
    const type = { id: 1, name: 'Sword' };
    mockEquipmentTypesService.findOne.mockResolvedValue(type);

    const result = await controller.findOne(1);

    expect(mockEquipmentTypesService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(type);
  });

  it('should call service.update()', async () => {
    const updated = { id: 1, name: 'Updated' };
    mockEquipmentTypesService.update.mockResolvedValue(updated);

    const result = await controller.update(1, { name: 'Updated' });

    expect(mockEquipmentTypesService.update).toHaveBeenCalledWith(1, {
      name: 'Updated',
    });
    expect(result).toEqual(updated);
  });

  it('should call service.delete()', async () => {
    const deleted = { id: 1 };
    mockEquipmentTypesService.delete.mockResolvedValue(deleted);

    const result = await controller.delete(1);

    expect(mockEquipmentTypesService.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual(deleted);
  });
});
