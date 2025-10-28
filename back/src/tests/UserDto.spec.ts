import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('User DTOs', () => {
  it('should validate a correct CreateUserDto', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Alice',
      email: 'alice@mail.com',
      password: 'password123',
      roleId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should detect errors in CreateUserDto', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: '',
      email: 'not-an-email',
      password: 'short',
      roleId: 'wrong-type',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.property)).toEqual(
      expect.arrayContaining(['name', 'email', 'password', 'roleId']),
    );
  });

  it('should validate a correct UpdateUserDto', async () => {
    const dto = plainToInstance(UpdateUserDto, {
      name: 'Bob',
      password: 'newpassword',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should detect errors in UpdateUserDto', async () => {
    const dto = plainToInstance(UpdateUserDto, {
      password: 'short',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
