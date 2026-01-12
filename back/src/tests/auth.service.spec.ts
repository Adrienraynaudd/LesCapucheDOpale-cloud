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
      verifyAsync: jest.fn(),
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
    const mockAdmin = { id: 1, email: 'admin@mail.com', roleId: 1, name: 'Admin User' };
    (usersService.validateUserByEmailPassword as jest.Mock).mockResolvedValue(
      mockAdmin,
    );

    const result = await authService.login('admin@mail.com', 'password123');
    expect(result).toEqual({ access_token: 'mockedToken', username: 'Admin User' });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1, email: 'admin@mail.com', roleId: 1 }),
      expect.any(Object),
    );
  });

  it('should return a token for regular user (roleId != 1)', async () => {
    const mockUser = { id: 2, email: 'user@mail.com', roleId: 2, name: 'Regular User' };
    (usersService.validateUserByEmailPassword as jest.Mock).mockResolvedValue(
      mockUser,
    );

    const result = await authService.login('user@mail.com', 'password123');
    expect(result).toEqual({ access_token: 'mockedToken', username: 'Regular User' });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 2, email: 'user@mail.com', roleId: 2 }),
      expect.any(Object),
    );
  });

  describe('verifyToken', () => {
    it('should return roleId when token is valid with JWT_SECRET', async () => {
      const mockPayload = { sub: 1, email: 'user@mail.com', roleId: 2 };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

      const result = await authService.verifyToken('validToken');
      
      expect(result).toEqual({ roleId: 2 });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
        secret: process.env.JWT_SECRET,
      });
    });

    it('should return roleId when token is valid with JWT_SECRET_ADMIN', async () => {
      const mockPayload = { sub: 1, email: 'admin@mail.com', roleId: 1 };
      (jwtService.verifyAsync as jest.Mock)
        .mockRejectedValueOnce(new Error('jwt malformed'))
        .mockResolvedValueOnce(mockPayload);

      const result = await authService.verifyToken('validAdminToken');
      
      expect(result).toEqual({ roleId: 1 });
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validAdminToken', {
        secret: process.env.JWT_SECRET_ADMIN,
      });
    });

    it('should throw UnauthorizedException when token is invalid for both secrets', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('jwt malformed'),
      );

      await expect(authService.verifyToken('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.verifyToken('invalidToken')).rejects.toThrow(
        'Invalid token',
      );
    });
  });
});
