import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentStocksController } from '../controllers/equipment-stocks.controller';
import { EquipmentStocksService } from '../services/equipment-stocks.service';
import { CreateEquipmentStockDto } from '../dto/create-equipment-stock.dto';
import { UpdateEquipmentStockDto } from '../dto/update-equipment-stock.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

describe('EquipmentStocksController', () => {
  let controller: EquipmentStocksController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentStocksController],
      providers: [{ provide: EquipmentStocksService, useValue: mockService }],
    })
      
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EquipmentStocksController>(
      EquipmentStocksController,
    );
  });

  it('should call service.findAll', () => {
    mockService.findAll.mockReturnValue([{ id: 1 }]);
    expect(controller.findAll()).toEqual([{ id: 1 }]);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne with id', () => {
    mockService.findOne.mockReturnValue({ id: 1 });
    expect(controller.findOne(1)).toEqual({ id: 1 });
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('should call service.create with dto', () => {
    const dto: CreateEquipmentStockDto = { equipmentId: 1 };
    mockService.create.mockReturnValue({ id: 1, ...dto, durability: 100 });
    expect(controller.create(dto)).toEqual({ id: 1, ...dto, durability: 100 });
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.update with id and dto', () => {
    const dto: UpdateEquipmentStockDto = { equipmentId: 2 };
    mockService.update.mockReturnValue({ id: 1, ...dto });
    expect(controller.update(1, dto)).toEqual({ id: 1, ...dto });
    expect(mockService.update).toHaveBeenCalledWith(1, dto);
  });

  it('should call service.delete with id', () => {
    mockService.delete.mockReturnValue({ id: 1 });
    expect(controller.delete(1)).toEqual({ id: 1 });
    expect(mockService.delete).toHaveBeenCalledWith(1);
  });
});
