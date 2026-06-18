import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoServiceService } from '../../service/auto-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  router = inject(Router);
  servicio = inject(AutoServiceService);

  user: string = '';
  pass: string = '';
  error: boolean = false;

login() {
  this.error = false;

  if (!this.user || !this.pass) return;

  this.servicio.login(this.user, this.pass).subscribe({
    next: (usuario) => {
 // En tu login.component.ts, dentro del éxito del login:
if (usuario) {
    localStorage.setItem('isLogged', 'true');
    localStorage.setItem('login', JSON.stringify(usuario));
    localStorage.setItem('role', usuario.role);

    const ruta = usuario.role === 'admin' ? '/admin-users' : '/listado';

    this.router.navigate([ruta]).then(() => {
        // Esta línea es mágica: refresca el Navbar para que vea que eres Admin
        window.location.reload();
    });
} else {
        this.error = true;
      }
    },
    error: (err) => {
      console.error("Error de red:", err);
      this.error = true;
    }
  });
}
}
