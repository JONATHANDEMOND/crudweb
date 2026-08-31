import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [],
  templateUrl: './error404.component.html',
  styleUrl: './error404.component.css'
})
export class Error404Component {
  private router = inject(Router);

  irAlInicio() {
    const isLogged = localStorage.getItem('isLogged');
    const role = localStorage.getItem('role');

    if (isLogged === 'true') {
      // Si está logueado, lo mandas a su panel correspondiente
      const ruta = role === 'admin' ? '/admin-users' : '/listado';
      this.router.navigate([ruta]);
    } else {
      // Si no tiene sesión, lo mandas al login
      this.router.navigate(['/login']);
    }
  }
}
