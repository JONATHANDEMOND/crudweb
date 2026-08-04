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
 
  pisoSeleccionado: string = '';

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
    // 1. Iniciamos con todos los datos
    let resultado = this.impresoras;

    // 2. Filtramos por Piso (si el usuario seleccionó uno)
    if (this.pisoSeleccionado) {
      resultado = resultado.filter(i =>
        i.piso && i.piso.toLowerCase() === this.pisoSeleccionado.toLowerCase()
      );
    }

    // 3. Filtramos por Texto (si el usuario escribió algo)
    if (this.busquedaGlobal) {
      const busqueda = this.busquedaGlobal.toLowerCase();
      resultado = resultado.filter(i =>
        (i.codigoAB || '').toLowerCase().includes(busqueda) ||
        (i.custodio || '').toLowerCase().includes(busqueda) ||
        (i.marcaModelo || '').toLowerCase().includes(busqueda) ||
        (i.oficina || '').toLowerCase().includes(busqueda)
      );
    }

    // 4. Asignamos el resultado final a la tabla
    this.impresorasFiltradas = resultado;
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
