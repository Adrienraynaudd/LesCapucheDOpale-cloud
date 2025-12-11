import { Test, TestingModule } from '@nestjs/testing';
import { QuestStockEquipmentController } from '../controllers/quest-stock-equipment.controller';
import { QuestStockEquipmentService } from '../services/quest-stock-equipment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateQuestStockEquipmentDto } from '../dto/create-quest-stock-equipment.dto';

describe('QuestStockEquipmentController', () => {
  let controller: QuestStockEquipmentController;
  let service: QuestStockEquipmentService;

  const mockService = {
    findAll: jest.fn(),
    attach: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
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
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<QuestStockEquipmentController>(
      QuestStockEquipmentController,
    );
    service = module.get<QuestStockEquipmentService>(QuestStockEquipmentService);
  });

  describe('list', () => {
    it('should call service.findAll with undefined when no questId provided', async () => {
      // Arrange
      const expectedResult = [{ id: 1, questId: 10, equipmentStockId: 2, quantity: 1 }];
      mockService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.list(undefined);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should call service.findAll with a specific questId', async () => {
      // Arrange
      const questId = 12;
      const expectedResult = [{ id: 2, questId: 12, equipmentStockId: 3, quantity: 5 }];
      mockService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.list(questId);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(questId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('attach', () => {
    it('should call service.attach with the correct DTO', async () => {
      // Arrange
      const dto: CreateQuestStockEquipmentDto = {
        questId: 12,
        equipmentStockId: 3
      };
      const expectedResult = { id: 101, ...dto, createdAt: new Date(), updatedAt: new Date() };
      mockService.attach.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.attach(dto);

      // Assert
      expect(service.attach).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should call service.delete with the correct ID', async () => {
      // Arrange
      const idToDelete = 101;
      const expectedResult = { id: idToDelete, deleted: true };
      mockService.delete.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.delete(idToDelete);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(idToDelete);
      expect(result).toEqual(expectedResult);
    });
  });
});