import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoServiceService } from '../../service/auto-service.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  servicio = inject(AutoServiceService);

  // Variables para el formulario
  nuevoNombre: string = '';
  nuevoUser: string = '';
  nuevoPass: string = '';

  listaUsuarios: any[] = [];

  ngOnInit() {
    this.cargarUsuarios();
  }

  // Carga los usuarios desde db.json
  cargarUsuarios() {
    this.servicio.getUsuarios().subscribe(res => {
      this.listaUsuarios = res;
    });
  }

  // Registra y guarda permanentemente
  registrarUsuario() {
    if (this.nuevoNombre && this.nuevoUser) {
      const nuevo = {
        nombre: this.nuevoNombre,
        user: this.nuevoUser,
        pass: this.nuevoPass,
        role: 'user'
      };

      this.servicio.postUsuario(nuevo).subscribe(() => {
        alert('Técnico ' + this.nuevoNombre + ' guardado en base de datos');
        this.cargarUsuarios(); // Recarga la tabla automáticamente
        this.limpiarFormulario();
      });
    }
  }

  // Elimina el técnico de la base de datos por su ID
  quitarAcceso(id: any) {
    if (confirm('¿Está seguro de eliminar este acceso?')) {
      this.servicio.deleteUsuario(id).subscribe(() => {
        this.cargarUsuarios(); // Refresca la lista tras eliminar
      });
    }
  }

  limpiarFormulario() {
    this.nuevoNombre = '';
    this.nuevoUser = '';
    this.nuevoPass = '';
  }
}
