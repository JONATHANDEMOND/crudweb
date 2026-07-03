import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Importamos tu servicio unificado
import { AutoServiceService } from '../../service/auto-service.service';

@Component({
  selector: 'app-impresoras-edificio-central',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './impresoras-edificio-central.component.html',
  styleUrls: ['./impresoras-edificio-central.component.css']
})
export class ImpresorasEdificioCentralComponent implements OnInit {
  impresoras: any[] = [];
  impresorasFiltradas: any[] = [];
  busquedaGlobal: string = '';

  impresoraActual: any = {};
  mostrarModalRegistro: boolean = false;
  modoEdicion: boolean = false;

  // Inyectamos el servicio en lugar de HttpClient directo
  constructor(private autoService: AutoServiceService) {}

  ngOnInit() {
    this.obtenerImpresoras();
  }

  obtenerImpresoras() {
    this.autoService.getImpresorasEC().subscribe(data => {
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
    this.impresorasFiltradas = this.impresoras.filter(i =>
      (i.custodio || '').toLowerCase().includes(busqueda) ||
      (i.oficina || '').toLowerCase().includes(busqueda)
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
    if (this.modoEdicion && this.impresoraActual._id) {
      this.autoService.updateImpresoraEC(this.impresoraActual._id, this.impresoraActual)
        .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
    } else {
      this.autoService.postImpresoraEC(this.impresoraActual)
        .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
    }
  }

  eliminar(_id: string) {
    if (_id && confirm('¿Estás seguro de eliminar esta impresora?')) {
      this.autoService.deleteImpresoraEC(_id).subscribe(() => this.obtenerImpresoras());
    }
  }

  marcarMantenimiento(item: any) {
    if (item._id) {
      this.autoService.updateImpresoraEC(item._id, item).subscribe({
        next: () => console.log('Mantenimiento actualizado'),
        error: () => item.mantenimientoRealizado = !item.mantenimientoRealizado
      });
    }
  }
}
