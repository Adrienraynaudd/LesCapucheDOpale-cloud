import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
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
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create()', async () => {
    const dto = {
      name: 'Alice',
      email: 'a@mail.com',
      password: '1234',
      roleId: 1,
    };
    mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto);

    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call service.findAll()', async () => {
    const users = [{ id: 1, name: 'Bob', email: 'b@mail.com' }];
    mockUsersService.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(mockUsersService.findAll).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should call service.findOne()', async () => {
    const user = { id: 1, name: 'Alice', email: 'a@mail.com' };
    mockUsersService.findOne.mockResolvedValue(user);

    const result = await controller.findOne(1);

    expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(user);
  });

  it('should call service.update()', async () => {
    const updated = { id: 1, name: 'Updated' };
    mockUsersService.update.mockResolvedValue(updated);

    const result = await controller.update(1, { name: 'Updated' });

    expect(mockUsersService.update).toHaveBeenCalledWith(1, {
      name: 'Updated',
    });
    expect(result).toEqual(updated);
  });

  it('should call service.delete()', async () => {
    const deleted = { id: 1 };
    mockUsersService.delete.mockResolvedValue(deleted);

    const result = await controller.delete(1);

    expect(mockUsersService.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual(deleted);
  });
});
