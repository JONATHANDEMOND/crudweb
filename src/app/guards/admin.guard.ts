import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Obtenemos el rol guardado durante el login
  const role = localStorage.getItem('role');

  if (role === 'admin') {
    return true; // Si es admin, puede pasar a gestionar usuarios
  } else {
    // Si es un técnico normal u otro usuario, lo mandamos al listado
    alert('Acceso denegado: Solo el Administrador puede ingresar aquí.');
    router.navigate(['/listado']);
    return false;
  }
};
