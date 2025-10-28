import { Test, TestingModule } from '@nestjs/testing';
import { QuestStockEquipmentController } from '../controllers/quest-stock-equipment.controller';
import { QuestStockEquipmentService } from '../services/quest-stock-equipment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateQuestStockEquipmentDto } from '../dto/create-quest-stock-equipment.dto';

describe('QuestStockEquipmentController', () => {
  let controller: QuestStockEquipmentController;
  const mockService = {
    findAll: jest.fn(),
    attach: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestStockEquipmentController],
      providers: [
        { provide: QuestStockEquipmentService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<QuestStockEquipmentController>(
      QuestStockEquipmentController,
    );
  });

  it('should call service.findAll without questId', () => {
    mockService.findAll.mockReturnValue([{ id: 1 }]);
    expect(controller.list()).toEqual([{ id: 1 }]);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should call service.findAll with questId', () => {
    mockService.findAll.mockReturnValue([{ id: 2 }]);
    expect(controller.list(5)).toEqual([{ id: 2 }]);
    expect(mockService.findAll).toHaveBeenCalledWith(5);
  });

  it('should call service.attach with dto', () => {
    const dto: CreateQuestStockEquipmentDto = {
      questId: 1,
      equipmentStockId: 2,
    };
    mockService.attach.mockReturnValue({ id: 10, ...dto });
    expect(controller.attach(dto)).toEqual({ id: 10, ...dto });
    expect(mockService.attach).toHaveBeenCalledWith(dto);
  });

  it('should call service.delete with id', () => {
    mockService.delete.mockReturnValue({ id: 7 });
    expect(controller.delete(7)).toEqual({ id: 7 });
    expect(mockService.delete).toHaveBeenCalledWith(7);
  });
});
