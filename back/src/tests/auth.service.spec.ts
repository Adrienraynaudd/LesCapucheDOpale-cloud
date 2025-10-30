import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, any>>;
  let jwtService: Partial<Record<keyof JwtService, any>>;

  beforeEach(async () => {
    usersService = {
      validateUserByEmailPassword: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mockedToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    (usersService.validateUserByEmailPassword as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(
      authService.login('wrong@mail.com', 'badpass'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return a token for admin (roleId = 1)', async () => {
    const mockAdmin = { id: 1, email: 'admin@mail.com', roleId: 1 };
    (usersService.validateUserByEmailPassword as jest.Mock).mockResolvedValue(
      mockAdmin,
    );

    const result = await authService.login('admin@mail.com', 'password123');
    expect(result).toEqual({ access_token: 'mockedToken', user: mockAdmin });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1, email: 'admin@mail.com', roleId: 1 }),
      expect.any(Object),
    );
  });

  it('should return a token for regular user (roleId != 1)', async () => {
    const mockUser = { id: 2, email: 'user@mail.com', roleId: 2 };
    (usersService.validateUserByEmailPassword as jest.Mock).mockResolvedValue(
      mockUser,
    );

    const result = await authService.login('user@mail.com', 'password123');
    expect(result).toEqual({ access_token: 'mockedToken', user: mockUser });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 2, email: 'user@mail.com', roleId: 2 }),
      expect.any(Object),
    );
  });
});
