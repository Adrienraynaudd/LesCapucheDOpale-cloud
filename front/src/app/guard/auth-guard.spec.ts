import { TestBed } from '@angular/core/testing';
import { Router, CanActivateFn } from '@angular/router';
import { authGuard } from './auth-guard';
import { AccountService } from '../services/account/account.service';
import { of, throwError } from 'rxjs';
import { Observable } from 'rxjs';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAccountService: jasmine.SpyObj<AccountService>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAccountService = jasmine.createSpyObj('AccountService', ['isLogin']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AccountService, useValue: mockAccountService }
      ]
    });
  });

  it('should allow activation when user is logged in', (done) => {
    mockAccountService.isLogin.and.returnValue(of({ roleId: '1' }));

    const result = executeGuard({} as any, {} as any);

    (result as Observable<boolean>).subscribe((value) => {
      expect(value).toBeTrue();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to /login when user is not logged in', (done) => {
    mockAccountService.isLogin.and.returnValue(of(false));

    const result = executeGuard({} as any, {} as any);

    (result as Observable<boolean>).subscribe((value) => {
      expect(value).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should redirect to /login on error (401)', (done) => {
    mockAccountService.isLogin.and.returnValue(throwError(() => ({ status: 401 })));

    const result = executeGuard({} as any, {} as any);

    (result as Observable<boolean>).subscribe((value) => {
      expect(value).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should store roleId in localStorage when user is logged in', (done) => {
    spyOn(localStorage, 'setItem');
    mockAccountService.isLogin.and.returnValue(of({ roleId: '2' }));

    const result = executeGuard({} as any, {} as any);

    (result as Observable<boolean>).subscribe((value) => {
      expect(localStorage.setItem).toHaveBeenCalledWith('role', '2');
      done();
    });
  });
});
