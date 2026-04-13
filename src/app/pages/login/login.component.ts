import { Component, inject,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoServiceService } from '../../service/auto-service.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  router = inject(Router);

  user: string = '';
  pass: string = '';
  error: boolean = false;
  servicio = inject(AutoServiceService);
  listaUsuarios: any[] = [];


  login() {
  this.servicio.login(this.user, this.pass).subscribe(usuario => {
    if (usuario) {
      localStorage.setItem('isLogged', 'true');
      localStorage.setItem('role', usuario.role);

      // Redirección según el rol que viene de la base de datos
      const ruta = usuario.role === 'admin' ? '/admin-users' : '/listado';
      this.router.navigate([ruta]);
    } else {
      this.error = true;
    }
  });
}// <--- LLAVE DE CIERRE DE LA FUNCIÓN LOGIN
} // <--- LLAVE DE CIERRE DE LA CLASE
