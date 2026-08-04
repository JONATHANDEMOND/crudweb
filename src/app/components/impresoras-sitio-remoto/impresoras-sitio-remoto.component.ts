import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Importamos tu servicio unificado
import { AutoServiceService } from '../../service/auto-service.service';

@Component({
  selector: 'app-impresoras-sitio-remoto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './impresoras-sitio-remoto.component.html',
  styleUrls: ['./impresoras-sitio-remoto.component.css']
})
export class ImpresorasSitioRemotoComponent implements OnInit {
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
    // Asegúrate de tener getImpresorasSR en tu servicio
    this.autoService.getImpresorasSR().subscribe(data => {
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
      (i.codigoAB || '').toLowerCase().includes(busqueda) ||
      (i.custodio || '').toLowerCase().includes(busqueda) ||
      (i.marcaModelo || '').toLowerCase().includes(busqueda) ||
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
      this.autoService.updateImpresoraSR(this.impresoraActual._id, this.impresoraActual)
        .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
    } else {
      this.autoService.postImpresoraSR(this.impresoraActual)
        .subscribe(() => { this.obtenerImpresoras(); this.cerrarModalRegistro(); });
    }
  }

  eliminar(_id: string) {
    if (_id && confirm('¿Estás seguro de eliminar esta impresora?')) {
      this.autoService.deleteImpresoraSR(_id).subscribe(() => this.obtenerImpresoras());
    }
  }

  // ==========================================
  // --- MANTENIMIENTO DE IMPRESORAS (ACTUALIZADO) ---
  // ==========================================

  marcarMantenimiento(item: any) {
    if (!item._id) {
      alert('Esta impresora es nueva y aún no se ha sincronizado su ID. Por favor, recarga la página e intenta de nuevo.');
      setTimeout(() => item.mantenimientoRealizado = !item.mantenimientoRealizado, 100);
      return;
    }

    // 1. Bloqueo visual
    item.guardandoMantenimiento = true;

    // 2. Preparación del historial
    if (!item.historialMantenimientos) {
      item.historialMantenimientos = [];
    }

    const estadoSwitchAnterior = !item.mantenimientoRealizado;
    const historialAnterior = [...item.historialMantenimientos];
    const fechaPlanaAnterior = item.fechaUltimoMantenimiento;

    // 3. Lógica de fechas
    if (item.mantenimientoRealizado) {
      const nuevaFecha = new Date().toISOString();
      item.historialMantenimientos.push({ fecha: nuevaFecha });
      item.fechaUltimoMantenimiento = nuevaFecha;
    } else {
      item.fechaUltimoMantenimiento = null;
    }

    // 4. Llamada al servicio (usando updateImpresoraEC)
    this.autoService.updateImpresoraEC(item._id, item).subscribe({
      next: (res: any) => {
        console.log('Mantenimiento EC guardado:', res);
        item.guardandoMantenimiento = false;
      },
      error: (err: any) => {
        console.error('Error al actualizar mantenimiento EC:', err);
        // Reversión
        item.mantenimientoRealizado = estadoSwitchAnterior;
        item.historialMantenimientos = historialAnterior;
        item.fechaUltimoMantenimiento = fechaPlanaAnterior;
        item.guardandoMantenimiento = false;
        alert('Error al guardar el mantenimiento en la base de datos.');
      }
    });
  }

  limpiarMantenimiento(item: any) {
    if (!item._id) return;

    if (confirm('¿Está seguro de que desea eliminar todo el historial de mantenimiento de esta impresora?')) {
      item.guardandoMantenimiento = true;
      item.mantenimientoRealizado = false;
      item.fechaUltimoMantenimiento = null;
      item.historialMantenimientos = [];

      this.autoService.updateImpresoraEC(item._id, item).subscribe({
        next: () => {
          console.log('Historial de impresora limpiado.');
          item.guardandoMantenimiento = false;
        },
        error: (err) => {
          console.error('Error al limpiar:', err);
          item.guardandoMantenimiento = false;
          alert('No se pudo limpiar el historial.');
        }
      });
    }
  }
}
