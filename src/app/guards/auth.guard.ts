import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isLogged = localStorage.getItem('isLogged');

  if (isLogged === 'true') {
    return true; // Permite el paso
  } else {
    router.navigate(['/login']); // Bloquea y manda al login
    return false;
  }
};
