import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TablaComponent } from './components/tabla/tabla.component';
import { FormularioComponent } from './components/formulario/formulario.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
export const routes: Routes = [

{ path: 'admin-users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'listado', component: TablaComponent, canActivate: [authGuard] },
  { path: 'gestion', component: FormularioComponent, canActivate: [authGuard] },
  { path: 'admin-users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
