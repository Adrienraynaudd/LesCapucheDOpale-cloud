import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(() => {
    reflector = mockReflector as unknown as Reflector;
    guard = new RolesGuard(reflector);
    jest.clearAllMocks();
  });

  type User = { id?: number; roleId?: number };

  const mockContext = (
    user: User,
    roles: number[] | undefined,
  ): ExecutionContext => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    mockReflector.get.mockReturnValue(roles);
    return context;
  };

  it('should throw ForbiddenException if no roles are defined', () => {
    const context = mockContext({ id: 1, roleId: 2 }, undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow if user has required role', () => {
    const context = mockContext({ id: 1, roleId: 1 }, [1]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow if user has one of multiple roles', () => {
    const context = mockContext({ id: 1, roleId: 2 }, [1, 2]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user role not allowed', () => {
    const context = mockContext({ id: 1, roleId: 2 }, [1]);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user has no role', () => {
    const context = mockContext({ id: 1 }, [1]);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
