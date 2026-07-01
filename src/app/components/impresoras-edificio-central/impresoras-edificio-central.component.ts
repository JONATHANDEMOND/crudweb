import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';// Asegúrate de importar FormsModule

@Component({
  selector: 'app-impresoras-edificio-central',
  standalone: true, // Asegúrate de tener esto
    imports: [FormsModule, CommonModule], // Asegúrate de importar FormsModule si estás usando ngModel
  templateUrl: './impresoras-edificio-central.component.html', // Verifica que este nombre sea EXACTAMENTE igual al nombre del archivo en la carpeta
  styleUrls: ['./impresoras-edificio-central.component.css']  // Verifica también que el nombre del CSS coincida
})
export class ImpresorasEdificioCentralComponent implements OnInit {
  impresoras: any[] = [];
  impresorasFiltradas: any[] = [];
  busquedaGlobal: string = '';

  // Objeto para el modal
  impresoraActual: any = {};
  mostrarModalRegistro: boolean = false;
  modoEdicion: boolean = false;

  // CAMBIA ESTA RUTA según corresponda: '/api/impresoras-ec' o '/api/impresoras-sr'
  private apiUrl = 'http://localhost:4000/api/impresoras-ec';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerImpresoras();
  }

  obtenerImpresoras() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.impresoras = data;
      this.impresorasFiltradas = data;
    });
  }

  filtrarImpresoras() {
    this.impresorasFiltradas = this.impresoras.filter(i =>
      i.custodio.toLowerCase().includes(this.busquedaGlobal.toLowerCase()) ||
      i.oficina.toLowerCase().includes(this.busquedaGlobal.toLowerCase())
    );
  }

  abrirModalRegistro(impresora: any = null) {
    this.modoEdicion = !!impresora;
    this.impresoraActual = impresora ? { ...impresora } : {};
    this.mostrarModalRegistro = true;
  }

  cerrarModalRegistro() {
    this.mostrarModalRegistro = false;
  }

  guardar() {
    // Si modoEdicion es verdadero, usamos el _id de MongoDB
    if (this.modoEdicion) {
      // IMPORTANTE: Asegúrate de usar _id (con guion bajo)
      this.http.put(`${this.apiUrl}/${this.impresoraActual._id}`, this.impresoraActual)
        .subscribe({
          next: () => {
            this.obtenerImpresoras();
            this.cerrarModalRegistro();
          },
          error: (err) => console.error("Error al actualizar:", err)
        });
    } else {
      // Al guardar uno nuevo, NO enviamos el _id, MongoDB lo genera solo
      this.http.post(this.apiUrl, this.impresoraActual)
        .subscribe({
          next: () => {
            this.obtenerImpresoras();
            this.cerrarModalRegistro();
          },
          error: (err) => console.error("Error al guardar:", err)
        });
    }
  }

  eliminar(id: string) {
    if (confirm('¿Estás seguro de eliminar esta impresora?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.obtenerImpresoras());
    }
  }

  marcarMantenimiento(item: any) {
    this.http.put(`${this.apiUrl}/${item._id}`, item).subscribe({
      next: () => console.log('Mantenimiento actualizado'),
      error: () => item.mantenimientoRealizado = !item.mantenimientoRealizado
    });
  }
}
