import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Recuperamos el objeto de login
  const sesion = localStorage.getItem('login');

  if (sesion) {
    const usuario = JSON.parse(sesion);

    // Si el rol es admin, permitimos el paso
    if (usuario.role === 'admin') {
      return true;
    }
  }

  // Si no es admin, lo mandamos al listado normal y bloqueamos el paso
  alert('Acceso denegado: Se requieren permisos de Administrador.');
  router.navigate(['/listado']);
  return false;
};
