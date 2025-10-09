import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, comparePassword } from '../utils/password.util';

jest.mock('../utils/password.util');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    service = new UsersService(prisma);
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (comparePassword as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => jest.clearAllMocks());

  // ------------------------
  // CREATE
  // ------------------------
  it('should create a new user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Alice',
      email: 'alice@mail.com',
    });

    const result = await service.create({
      name: 'Alice',
      email: 'alice@mail.com',
      password: 'secret',
      roleId: 1,
    });

    expect(hashPassword).toHaveBeenCalledWith('secret');
    expect(result).toEqual({
      id: 1,
      name: 'Alice',
      email: 'alice@mail.com',
    });
  });

  it('should throw ConflictException if email already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'exists@mail.com' });

    await expect(
      service.create({ name: 'Bob', email: 'exists@mail.com', password: '123', roleId: 1 }),
    ).rejects.toThrow(ConflictException);
  });

  // ------------------------
  // FIND ALL
  // ------------------------
  it('should return all users', async () => {
    const users = [{ id: 1, name: 'Bob', email: 'bob@mail.com' }];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
  });

  // ------------------------
  // FIND ONE
  // ------------------------
  it('should return a user by id', async () => {
    const user = { id: 1, name: 'Bob', email: 'bob@mail.com' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

    const result = await service.findOne(1);
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // ------------------------
  // UPDATE
  // ------------------------
  it('should update a user', async () => {
    const updated = { id: 1, name: 'New Bob', email: 'bob@mail.com' };
    (prisma.user.update as jest.Mock).mockResolvedValue(updated);

    const result = await service.update(1, { name: 'New Bob' });
    expect(result).toEqual(updated);
  });

  it('should hash password if provided in update', async () => {
    const updated = { id: 1, name: 'Bob', email: 'bob@mail.com' };
    (prisma.user.update as jest.Mock).mockResolvedValue(updated);

    const result = await service.update(1, { password: 'newpass' });
    expect(hashPassword).toHaveBeenCalledWith('newpass');
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException if updating non-existent user', async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(NotFoundException);
  });

  // ------------------------
  // REMOVE
  // ------------------------
  it('should delete a user', async () => {
    (prisma.user.delete as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await service.remove(1);
    expect(result).toEqual({ deleted: true });
  });

  it('should throw NotFoundException if deleting non-existent user', async () => {
    (prisma.user.delete as jest.Mock).mockRejectedValue(new Error('not found'));
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });

  // ------------------------
  // VALIDATE USER
  // ------------------------
  it('should return null if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await service.validateUserByEmailPassword('nouser@mail.com', 'pass');
    expect(result).toBeNull();
  });

  it('should return null if password does not match', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'a@mail.com', password: 'hashed', name: 'Alice' });
    (comparePassword as jest.Mock).mockResolvedValue(false);

    const result = await service.validateUserByEmailPassword('a@mail.com', 'wrong');
    expect(result).toBeNull();
  });

  it('should return user data without password if valid', async () => {
    const fakeUser = { id: 1, email: 'a@mail.com', password: 'hashed', name: 'Alice' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (comparePassword as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUserByEmailPassword('a@mail.com', '123');
    expect(result).toEqual({ id: 1, email: 'a@mail.com', name: 'Alice' });
  });
});
