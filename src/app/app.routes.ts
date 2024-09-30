import { Routes } from '@angular/router';
import { ListadoAutosComponent } from './pages/listado-autos/listado-autos.component';
import { GestionAutosComponent } from './pages/gestion-autos/gestion-autos.component';
import { EditarAutosComponent } from './pages/editar-autos/editar-autos.component';
import { Error404Component } from './pages/error404/error404.component';

export const routes: Routes = [
    {path: 'listado', component:ListadoAutosComponent},
    {path:'gestion',component:GestionAutosComponent},

    {path:'editar/:idAutos',component:EditarAutosComponent},


    {path: '', redirectTo: 'listado', pathMatch: 'full'},
    {path: '**', component: Error404Component}
    
];
