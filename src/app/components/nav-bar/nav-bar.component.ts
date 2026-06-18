import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavbarComponent {
  router = inject(Router);

  // Usamos GETTERS para que Angular siempre tenga el valor fresco
  get isLoggedIn(): boolean {
    return localStorage.getItem('isLogged') === 'true';
  }

  get esAdmin(): boolean {
    // Verificamos el rol directamente del storage
    return localStorage.getItem('role') === 'admin';
  }

  logout() {
    localStorage.clear();
    // Forzamos la navegación al login
    this.router.navigate(['/login']);
  }
}
