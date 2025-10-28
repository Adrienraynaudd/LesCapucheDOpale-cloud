import { Test, TestingModule } from '@nestjs/testing';
import { StatusesController } from '../controllers/statuses.controller';
import { StatusesService } from '../services/statuses.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

describe('StatusesController', () => {
  let controller: StatusesController;
  const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusesController],
      providers: [{ provide: StatusesService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<StatusesController>(StatusesController);
  });

  it('should call service.findAll', () => {
    mockService.findAll.mockReturnValue([{ id: 1 }]);
    expect(controller.list()).toEqual([{ id: 1 }]);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should call service.create with dto', () => {
    const dto: CreateStatusDto = { name: 'new' };
    mockService.create.mockReturnValue({ id: 5, name: 'new' });
    expect(controller.create(dto)).toEqual({ id: 5, name: 'new' });
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.update with id and dto', () => {
    const dto: UpdateStatusDto = { name: 'upd' };
    mockService.update.mockReturnValue({ id: 6, name: 'upd' });
    expect(controller.update(6, dto)).toEqual({ id: 6, name: 'upd' });
    expect(mockService.update).toHaveBeenCalledWith(6, dto);
  });

  it('should call service.delete with id', () => {
    mockService.delete.mockReturnValue({ id: 7 });
    expect(controller.delete(7)).toEqual({ id: 7 });
    expect(mockService.delete).toHaveBeenCalledWith(7);
  });
});
