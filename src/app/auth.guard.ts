import {CanActivateFn, Router} from '@angular/router';
import {getUsername} from "./allservice";
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const username = getUsername()

  if (username) {
    return true
  }

  router.navigate(['/']).then()
  return false;
};
