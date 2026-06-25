import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { FormularioComponent } from './components/formulario/formulario.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';

// Importaciones del Edificio Central
import { TablaListadoComponent } from './components/tabla-listado/tabla-listado.component';
import { FormularioCentralComponent } from './components/formulario-central/formulario-central.component'; // <-- ¡FALTABA ESTA LÍNEA!

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Inventario S.R.
  { path: 'listado', component: TablaComponent, canActivate: [authGuard] },

  // Inventario Edificio Central
  { path: 'listadoedfcent', component: TablaListadoComponent, canActivate: [authGuard] },

  // Registro de Equipos (Edificio Central)
  { path: 'registro-central', component: FormularioCentralComponent, canActivate: [authGuard] },

  // Administración de Usuarios
  { path: 'admin-users', component: AdminUsersComponent, canActivate: [adminGuard] },

  // Redirección inicial por defecto
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Comodín para rutas inexistentes (Error 404 encubierto)
  { path: '**', redirectTo: 'login' }
];
