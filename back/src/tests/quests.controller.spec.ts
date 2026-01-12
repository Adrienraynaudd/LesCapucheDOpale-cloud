import { Test, TestingModule } from '@nestjs/testing';
import { QuestsController, AuthenticatedRequest } from '../controllers/quests.controller';
import { QuestsService } from '../services/quests.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { UpdateStatusDto } from '../dto/update-quest-status.dto';
import { ValidateQuestDto } from '../dto/validate-quest.dto';
import { IdsDto } from '../dto/ids.dto';
import { FinishQuestDto } from '../dto/finish-quest.dto';
import { QuestConsumablesDto } from '../dto/quest-consumable.dto';

describe('QuestsController', () => {
  let controller: QuestsController;
  let service: QuestsService;

  const mockService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    attachAdventurers: jest.fn(),
    detachAdventurers: jest.fn(),
    setAdventurers: jest.fn(),
    attachEquipmentStocks: jest.fn(),
    detachEquipmentStocks: jest.fn(),
    setEquipmentStocks: jest.fn(),
    validateQuest: jest.fn(),
    invalidateQuest: jest.fn(),
    startQuest: jest.fn(),
    finishQuest: jest.fn(),
    refuseQuest: jest.fn(),
    abandonQuest: jest.fn(),
    attachConsumables: jest.fn(),
    setConsumables: jest.fn(),
    detachConsumables: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestsController],
      providers: [{ provide: QuestsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<QuestsController>(QuestsController);
    service = module.get<QuestsService>(QuestsService);
  });

  describe('findAll (Filtering & Sorting)', () => {
    it('should call service.findAll with all parameters parsed correctly', async () => {
      const query = {
        rewardMin: 100,
        rewardMax: 500,
        statusId: 2,
        finalDateBefore: '2025-12-31',
        finalDateAfter: '2025-01-01',
        userId: 5,
        avgXpMin: 10,
        avgXpMax: 50,
        sortBy: 'reward' as const,
        order: 'desc' as const,
      };

      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should call service.findAll with undefined when query is empty', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('CRUD & Status Updates', () => {
    it('should create a quest', async () => {
      const dto: CreateQuestDto = {
        name: 'New Quest',
        description: 'Desc',
        finalDate: new Date(),
        reward: 100,
        estimatedDuration: 10,
      };
      const req = { user: { sub: 123 } } as AuthenticatedRequest;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(req, dto);

      expect(service.create).toHaveBeenCalledWith(123, dto);
      expect(result).toEqual(expected);
    });

    it('should find one quest', async () => {
      const expected = { id: 1, name: 'Q1' };
      mockService.findOne.mockResolvedValue(expected);
      expect(await controller.findOne(1)).toEqual(expected);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should update a quest', async () => {
      const dto: UpdateQuestDto = { name: 'Updated' };
      const expected = { id: 1, ...dto };
      mockService.update.mockResolvedValue(expected);
      expect(await controller.update(1, dto)).toEqual(expected);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should update status manually', async () => {
      const dto: UpdateStatusDto = { statusId: 3 };
      const expected = { id: 1, statusId: 3 };
      mockService.updateStatus.mockResolvedValue(expected);
      expect(await controller.updateStatus(1, dto)).toEqual(expected);
      expect(service.updateStatus).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('Adventurer Management', () => {
    const idsDto: IdsDto = { ids: [1, 2] };
    const expected = { id: 1, adventurerIds: [1, 2] };

    it('should attach adventurers', async () => {
      mockService.attachAdventurers.mockResolvedValue(expected);
      expect(await controller.attachAdventurers(1, idsDto)).toEqual(expected);
      expect(service.attachAdventurers).toHaveBeenCalledWith(1, idsDto.ids);
    });

    it('should detach adventurers', async () => {
      mockService.detachAdventurers.mockResolvedValue(expected);
      expect(await controller.detachAdventurers(1, idsDto)).toEqual(expected);
      expect(service.detachAdventurers).toHaveBeenCalledWith(1, idsDto.ids);
    });

    it('should set adventurers', async () => {
      mockService.setAdventurers.mockResolvedValue(expected);
      expect(await controller.setAdventurers(1, idsDto)).toEqual(expected);
      expect(service.setAdventurers).toHaveBeenCalledWith(1, idsDto.ids);
    });
  });

  describe('Equipment Management', () => {
    const idsDto: IdsDto = { ids: [10, 20] };
    const expected = { id: 1, equipmentStockIds: [10, 20] };

    it('should attach equipment', async () => {
      mockService.attachEquipmentStocks.mockResolvedValue(expected);
      expect(await controller.attachEquipment(1, idsDto)).toEqual(expected);
      expect(service.attachEquipmentStocks).toHaveBeenCalledWith(1, idsDto.ids);
    });

    it('should detach equipment', async () => {
      mockService.detachEquipmentStocks.mockResolvedValue(expected);
      expect(await controller.detachEquipment(1, idsDto)).toEqual(expected);
      expect(service.detachEquipmentStocks).toHaveBeenCalledWith(1, idsDto.ids);
    });

    it('should set equipment', async () => {
      mockService.setEquipmentStocks.mockResolvedValue(expected);
      expect(await controller.setEquipment(1, idsDto)).toEqual(expected);
      expect(service.setEquipmentStocks).toHaveBeenCalledWith(1, idsDto.ids);
    });
  });

  describe('Workflow Actions', () => {
    const questId = 42;

    it('should validate a quest', async () => {
      const dto: ValidateQuestDto = { xp: 500 };
      const expected = { id: questId, statusId: 2, recommendedXP: 500 };
      mockService.validateQuest.mockResolvedValue(expected);

      const result = await controller.validate(questId, dto);

      expect(service.validateQuest).toHaveBeenCalledWith(questId, 500);
      expect(result).toEqual(expected);
    });

    it('should invalidate a quest', async () => {
      const expected = { id: questId, statusId: 1 };
      mockService.invalidateQuest.mockResolvedValue(expected);

      const result = await controller.invalidate(questId);

      expect(service.invalidateQuest).toHaveBeenCalledWith(questId);
      expect(result).toEqual(expected);
    });

    it('should start a quest', async () => {
      const expected = { id: questId, statusId: 3, startDate: new Date() };
      mockService.startQuest.mockResolvedValue(expected);

      const result = await controller.start(questId);

      expect(service.startQuest).toHaveBeenCalledWith(questId);
      expect(result).toEqual(expected);
    });

    it('should finish a quest with success', async () => {
      const dto: FinishQuestDto = { isSuccess: true };
      const expected = { id: questId, statusId: 6, totalCost: 500 };
      mockService.finishQuest.mockResolvedValue(expected);

      const result = await controller.finish(questId, dto);

      expect(service.finishQuest).toHaveBeenCalledWith(questId, true);
      expect(result).toEqual(expected);
    });

    it('should finish a quest with failure', async () => {
      const dto: FinishQuestDto = { isSuccess: false };
      const expected = { id: questId, statusId: 7, totalCost: 300 };
      mockService.finishQuest.mockResolvedValue(expected);

      const result = await controller.finish(questId, dto);

      expect(service.finishQuest).toHaveBeenCalledWith(questId, false);
      expect(result).toEqual(expected);
    });

    it('should refuse a quest', async () => {
      const expected = { id: questId, statusId: 4 };
      mockService.refuseQuest.mockResolvedValue(expected);

      const result = await controller.refuse(questId);

      expect(service.refuseQuest).toHaveBeenCalledWith(questId);
      expect(result).toEqual(expected);
    });

    it('should abandon a quest', async () => {
      const expected = { id: questId, statusId: 5 };
      mockService.abandonQuest.mockResolvedValue(expected);

      const result = await controller.abandon(questId);

      expect(service.abandonQuest).toHaveBeenCalledWith(questId);
      expect(result).toEqual(expected);
    });
  });

  describe('Consumables Management', () => {
    const questId = 42;

    it('should attach consumables', async () => {
      const dto: QuestConsumablesDto = {
        consumables: [
          { consumableId: 1, quantity: 5 },
          { consumableId: 2, quantity: 3 },
        ],
      };
      const expected = { id: questId, questConsumables: dto.consumables };
      mockService.attachConsumables.mockResolvedValue(expected);

      const result = await controller.attachConsumables(questId, dto);

      expect(service.attachConsumables).toHaveBeenCalledWith(questId, dto.consumables);
      expect(result).toEqual(expected);
    });

    it('should detach consumables', async () => {
      const dto: QuestConsumablesDto = {
        consumables: [
          { consumableId: 1, quantity: 2 },
          { consumableId: 2, quantity: 5 },
        ],
      };
      const expected = { id: questId, questConsumables: [] };
      mockService.detachConsumables.mockResolvedValue(expected);

      const result = await controller.detachConsumables(questId, dto);

      expect(service.detachConsumables).toHaveBeenCalledWith(questId, dto.consumables);
      expect(result).toEqual(expected);
    });

    it('should set consumables', async () => {
      const dto: QuestConsumablesDto = {
        consumables: [{ consumableId: 3, quantity: 7 }],
      };
      const expected = { id: questId, questConsumables: dto.consumables };
      mockService.setConsumables.mockResolvedValue(expected);

      const result = await controller.setConsumables(questId, dto);

      expect(service.setConsumables).toHaveBeenCalledWith(questId, dto.consumables);
      expect(result).toEqual(expected);
    });
  });
});