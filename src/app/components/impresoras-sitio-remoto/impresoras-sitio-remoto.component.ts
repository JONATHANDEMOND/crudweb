import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';// Asegúrate de importar FormsModule

@Component({
  selector: 'app-impresoras-sitio-remoto',
  standalone: true, // Asegúrate de tener esto
  imports: [FormsModule, CommonModule], // Asegúrate de importar FormsModule si estás usando ngModel
  templateUrl: './impresoras-sitio-remoto.component.html', // Verifica que este nombre sea EXACTAMENTE igual al nombre del archivo en la carpeta
  styleUrls: ['./impresoras-sitio-remoto.component.css']  // Verifica también que el nombre del CSS coincida
})
export class ImpresorasComponent implements OnInit {
  impresoras: any[] = [];
  impresorasFiltradas: any[] = [];
  busquedaGlobal: string = '';

  // Objeto para el modal
  impresoraActual: any = {};
  mostrarModalRegistro: boolean = false;
  modoEdicion: boolean = false;

  // CAMBIA ESTA RUTA según corresponda: '/api/impresoras-ec' o '/api/impresoras-sr'
  private apiUrl = 'http://localhost:3000/api/impresoras-ec';

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
    if (this.modoEdicion) {
      this.http.put(`${this.apiUrl}/${this.impresoraActual._id}`, this.impresoraActual)
        .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
    } else {
      this.http.post(this.apiUrl, this.impresoraActual)
        .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
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
