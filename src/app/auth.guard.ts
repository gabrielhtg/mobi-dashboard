import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getUsername, isAuthorizedByIp } from './allservice';

// Guard untuk parent route
export const authGuard: CanActivateFn = (route, state) => {
  return checkAuthorization();
};

// Guard untuk child routes
export const authGuardChild: CanActivateChildFn = (route, state) => {
  return checkAuthorization();
};

// Fungsi pengecekan authorization
function checkAuthorization() {
  const router = inject(Router);
  const http = inject(HttpClient);
  const username = getUsername();

  isAuthorizedByIp(http, router);

  if (username) {
    return true;
  }

  router.navigate(['/']);
  return false;
}
