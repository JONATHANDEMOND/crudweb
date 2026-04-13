import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavbarComponent { // 'b' minúscula
  router = inject(Router);

  isLoggedIn(): boolean {
    return localStorage.getItem('isLogged') === 'true';
  }

  // CORRECCIÓN: Agregamos la función que faltaba
  esAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
