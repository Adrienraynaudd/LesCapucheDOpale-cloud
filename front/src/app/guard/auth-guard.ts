import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccountService } from '../services/account/account.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.isLogin().pipe(
    map((response) => {
      if (response === false || !response) {
        router.navigate(['/login']);
        return false;
      }
      localStorage.setItem('role', response.roleId);
      return true;
    }),
    catchError((error) => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
  