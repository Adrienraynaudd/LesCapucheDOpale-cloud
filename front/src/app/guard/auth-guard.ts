import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import {AccountService} from '../services/account/account.service';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = new AccountService(null as any);
  const router = inject(Router);
  
  if (accountService.isLogin()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
  
};
  