import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create()', async () => {
    const dto = { name: 'Alice', email: 'a@mail.com', password: '1234', roleId: 1 };
    mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call service.findAll()', async () => {
    const users = [{ id: 1, name: 'Bob', email: 'b@mail.com' }];
    mockUsersService.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should call service.findOne()', async () => {
    const user = { id: 1, name: 'Alice', email: 'a@mail.com' };
    mockUsersService.findOne.mockResolvedValue(user);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(user);
  });

  it('should call service.update()', async () => {
    const updated = { id: 1, name: 'Updated' };
    mockUsersService.update.mockResolvedValue(updated);

    const result = await controller.update(1, { name: 'Updated' });

    expect(service.update).toHaveBeenCalledWith(1, { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should call service.remove()', async () => {
    const deleted = { id: 1 };
    mockUsersService.remove.mockResolvedValue(deleted);

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual(deleted);
  });
});
