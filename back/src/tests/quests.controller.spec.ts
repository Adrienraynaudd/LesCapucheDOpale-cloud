import { Test, TestingModule } from '@nestjs/testing';
import { QuestsController } from '../controllers/quests.controller';
import { QuestsService } from '../services/quests.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

describe('QuestsController', () => {
  let controller: QuestsController;
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
  });

  it('should call service.create with userId from req and dto', () => {
    const dto: CreateQuestDto = { name: 'C1' } as any;
    const req = { user: { sub: 123 } } as any;
    mockService.create.mockReturnValue({ id: 1, ...dto });

    expect(controller.create(req, dto)).toEqual({ id: 1, ...dto });
    expect(mockService.create).toHaveBeenCalledWith(123, dto);
  });

  it('should call service.update with id and dto', () => {
    const dto: UpdateQuestDto = { name: 'Up' } as any;
    mockService.update.mockReturnValue({ id: 2, ...dto });

    expect(controller.update(2, dto)).toEqual({ id: 2, ...dto });
    expect(mockService.update).toHaveBeenCalledWith(2, dto);
  });

  it('should call service.findAll', () => {
  const mock = [{ id: 1, name: 'Q1' }];
  mockService.findAll = jest.fn().mockReturnValue(mock);

  expect(controller.findAll()).toBe(mock);
  expect(mockService.findAll).toHaveBeenCalled();
});

it('should call service.findOne with id', () => {
  const quest = { id: 5, name: 'Quest' };
  mockService.findOne = jest.fn().mockReturnValue(quest);

  expect(controller.findOne(5)).toBe(quest);
  expect(mockService.findOne).toHaveBeenCalledWith(5);
});

it('should call service.updateStatus', () => {
  const dto = { statusId: 2 };
  const res = { id: 1, statusId: 2 };
  mockService.updateStatus = jest.fn().mockReturnValue(res);

  expect(controller.updateStatus(1, dto)).toBe(res);
  expect(mockService.updateStatus).toHaveBeenCalledWith(1, dto);
});

it('should call service.attachAdventurers', () => {
  const body = { ids: [1, 2] };
  const res = { id: 10 };
  mockService.attachAdventurers = jest.fn().mockReturnValue(res);

  expect(controller.attachAdventurers(10, body)).toBe(res);
  expect(mockService.attachAdventurers).toHaveBeenCalledWith(10, body.ids);
});

it('should call service.detachAdventurers', () => {
  const body = { ids: [3] };
  const res = { id: 10 };
  mockService.detachAdventurers = jest.fn().mockReturnValue(res);

  expect(controller.detachAdventurers(10, body)).toBe(res);
  expect(mockService.detachAdventurers).toHaveBeenCalledWith(10, body.ids);
});

it('should call service.setAdventurers', () => {
  const body = { ids: [1, 2, 3] };
  const res = { id: 12 };
  mockService.setAdventurers = jest.fn().mockReturnValue(res);

  expect(controller.setAdventurers(12, body)).toBe(res);
  expect(mockService.setAdventurers).toHaveBeenCalledWith(12, body.ids);
});

it('should call service.attachEquipment', () => {
  const body = { ids: [9] };
  const res = { id: 15 };
  mockService.attachEquipmentStocks = jest.fn().mockReturnValue(res);

  expect(controller.attachEquipment(15, body)).toBe(res);
  expect(mockService.attachEquipmentStocks).toHaveBeenCalledWith(15, body.ids);
});

it('should call service.detachEquipment', () => {
  const body = { ids: [5] };
  const res = { id: 7 };
  mockService.detachEquipmentStocks = jest.fn().mockReturnValue(res);

  expect(controller.detachEquipment(7, body)).toBe(res);
  expect(mockService.detachEquipmentStocks).toHaveBeenCalledWith(7, body.ids);
});

it('should call service.setEquipment', () => {
  const body = { ids: [11, 12] };
  const res = { id: 20 };
  mockService.setEquipmentStocks = jest.fn().mockReturnValue(res);

  expect(controller.setEquipment(20, body)).toBe(res);
  expect(mockService.setEquipmentStocks).toHaveBeenCalledWith(20, body.ids);
});

});
