import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'supersecretkey' });
    guard = new JwtAuthGuard(jwtService);
  });

  const mockExecutionContext = (authHeader?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: authHeader ? { authorization: authHeader } : {},
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow valid token', () => {
    const token = jwtService.sign({ sub: 1, email: 'user@mail.com', role: 2 });
    const context = mockExecutionContext(`Bearer ${token}`);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if no header', () => {
    const context = mockExecutionContext();
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid format', () => {
    const context = mockExecutionContext('InvalidToken');
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token', () => {
    const context = mockExecutionContext('Bearer wrongtoken');
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
