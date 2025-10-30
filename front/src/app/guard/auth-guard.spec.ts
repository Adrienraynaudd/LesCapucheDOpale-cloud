import { TestBed } from '@angular/core/testing';
import { Router, CanActivateFn } from '@angular/router';
import { authGuard } from './auth-guard';
import { AccountService } from '../services/account/account.service';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: mockRouter }]
    });
  });

  it('should allow activation when user is logged in', () => {
    spyOn(AccountService.prototype, 'isLogin').and.returnValue(true);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBeTrue();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /login when user is not logged in', () => {
    spyOn(AccountService.prototype, 'isLogin').and.returnValue(false);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
