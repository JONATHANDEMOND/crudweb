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
export class ImpresorasSitioRemotoComponent implements OnInit {


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
  if (!this.busquedaGlobal) {
    this.impresorasFiltradas = this.impresoras;
    return;
  }

  const busqueda = this.busquedaGlobal.toLowerCase();

  this.impresorasFiltradas = this.impresoras.filter(i => {
    // Usamos el operador || '' para que si es undefined, se convierta en texto vacío
    const custodio = (i.custodio || '').toLowerCase();
    const oficina = (i.oficina || '').toLowerCase();

    return custodio.includes(busqueda) || oficina.includes(busqueda);
  });
}

  abrirModalRegistro(impresora: any = null) {
  if (impresora) {
    console.log("Editando impresora:", impresora); // <--- MIRA LA CONSOLA (F12)
    console.log("ID detectado:", impresora._id);   // <--- SI ESTO SALE UNDEFINED, AHÍ ESTÁ EL PROBLEMA
    this.impresoraActual = { ...impresora };
    this.modoEdicion = true;
  } else {
    this.impresoraActual = {};
    this.modoEdicion = false;
  }
  this.mostrarModalRegistro = true;
}

  cerrarModalRegistro() {
    this.mostrarModalRegistro = false;
  }
guardar() {
  console.log("Modo edición:", this.modoEdicion);
  console.log("ID actual:", this.impresoraActual._id);

  if (this.modoEdicion && this.impresoraActual._id) {
    // RUTA PUT: http://localhost:4000/api/impresoras-ec/ID_REAL
    this.http.put(`${this.apiUrl}/${this.impresoraActual._id}`, this.impresoraActual)
      .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
  } else {
    // RUTA POST: http://localhost:4000/api/impresoras-ec
    this.http.post(this.apiUrl, this.impresoraActual)
      .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
  }
}
  eliminar(_id: string) {
    if (confirm('¿Estás seguro de eliminar esta impresora?')) {
      this.http.delete(`${this.apiUrl}/${_id}`).subscribe(() => this.obtenerImpresoras());
    }
  }

  marcarMantenimiento(item: any) {
    this.http.put(`${this.apiUrl}/${item._id}`, item).subscribe({
      next: () => console.log('Mantenimiento actualizado'),
      error: () => item.mantenimientoRealizado = !item.mantenimientoRealizado
    });
  }
}
