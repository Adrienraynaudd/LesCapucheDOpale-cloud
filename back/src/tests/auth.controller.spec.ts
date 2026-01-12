import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should return a token on successful login', async () => {
    const mockDto = { email: 'user@mail.com', password: 'password123' };
    (authService.login as jest.Mock).mockResolvedValue({
      access_token: 'mockedToken',
    });

    const result = await authController.login(mockDto);
    expect(result).toEqual({ access_token: 'mockedToken' });
    expect(authService.login).toHaveBeenCalledWith(
      mockDto.email,
      mockDto.password,
    );
  });

  it('should throw UnauthorizedException if login fails', async () => {
    const mockDto = { email: 'wrong@mail.com', password: 'badpass' };
    (authService.login as jest.Mock).mockRejectedValue(
      new UnauthorizedException('Invalid credentials'),
    );

    await expect(authController.login(mockDto)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.login).toHaveBeenCalledWith(
      mockDto.email,
      mockDto.password,
    );
  });

  describe('verifyToken', () => {
    it('should verify token and return roleId', async () => {
      (authService.verifyToken as jest.Mock).mockResolvedValue({ roleId: 1 });

      const result = await authController.verifyToken('Bearer validToken');
      
      expect(result).toEqual({ roleId: 1 });
      expect(authService.verifyToken).toHaveBeenCalledWith('validToken');
    });

    it('should throw UnauthorizedException if no auth header', async () => {
      await expect(authController.verifyToken('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if header does not start with Bearer', async () => {
      await expect(authController.verifyToken('Basic token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
