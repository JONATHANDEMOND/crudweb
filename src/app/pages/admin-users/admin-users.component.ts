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
  if (this.nuevoNombre && this.nuevoUser && this.nuevoPass) {
    const nuevo = {
      nombre: this.nuevoNombre,
      usuario: this.nuevoUser, // Cambiado de 'user' a 'usuario' (revisa tu login)
      user: this.nuevoUser,    // Mantengo ambos por si acaso
      pass: this.nuevoPass,
      role: 'user'
    };

    this.servicio.postUsuario(nuevo).subscribe({
      next: () => {
        alert('Técnico ' + this.nuevoNombre + ' guardado correctamente');
        this.cargarUsuarios();
        this.limpiarFormulario();
      },
      error: (err) => alert('Error al guardar: ' + err)
    });
  } else {
    alert('Por favor, completa todos los campos.');
  }
}

// CORRECCIÓN: Ahora recibe el ID real de la base de datos
quitarAcceso(id: any) {
  if (!id) return; // Seguridad si el ID no existe
  if (confirm('¿Está seguro de eliminar este acceso?')) {
    this.servicio.deleteUsuario(id).subscribe(() => {
      this.cargarUsuarios();
    });
  }
}

  limpiarFormulario() {
    this.nuevoNombre = '';
    this.nuevoUser = '';
    this.nuevoPass = '';
  }
}
