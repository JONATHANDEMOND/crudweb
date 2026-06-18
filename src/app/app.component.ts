import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/nav-bar/nav-bar.component'; // Ajusta la ruta a tu navbar

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private router = inject(Router);

  // Esta función decide si mostrar el navbar o no
  mostrarNavbar(): boolean {
    // Retorna FALSE si la URL es '/login' o está vacía (redirección inicial)
    return this.router.url !== '/login' && this.router.url !== '/';
  }
}
