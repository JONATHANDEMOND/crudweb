import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoServiceService } from '../../service/auto-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
      next: (response: any) => {
        if (response) {
          localStorage.setItem('isLogged', 'true');
          localStorage.setItem('login', JSON.stringify(response));
          localStorage.setItem('role', response.role);

          const ruta = response.role === 'admin' ? '/admin-users' : '/listado';

          this.router.navigate([ruta]).then(() => {
            window.location.reload();
          });
        }
      },
      error: (err: any) => {
        console.error("Error de autenticación:", err);
        this.error = true;
      }
    });
  }
}
