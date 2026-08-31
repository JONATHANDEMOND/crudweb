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

  // --- VARIABLES PARA EL TRÁMITE DE BAJA ---
  equipoSeleccionados: any = null;
  archivoBaja: File | null = null;

  // CORRECCIÓN: Le agregamos ": any" y el campo "documento: null"
  datosBaja: any = {
    motivo: '',
    informe: '',
    observacion: '',
    fecha: new Date().toISOString().substring(0, 10),
    documento: null
  };

  // Inyectamos el servicio en lugar de HttpClient directo
  constructor(private autoService: AutoServiceService) {}

  ngOnInit() {
    this.obtenerImpresoras();
  }

  obtenerImpresoras() {
    // Asegúrate de tener getImpresorasSR en tu servicio
    this.autoService.getImpresorasSR().subscribe(data => {
      // Filtramos para que NO se muestren las impresoras que ya fueron dadas de baja
      this.impresoras = data.filter((item: any) => item.estadoFisico !== 'De Baja');
      this.impresorasFiltradas = [...this.impresoras];
    });
  }

  filtrarImpresoras() {
    if (!this.busquedaGlobal) {
      this.impresorasFiltradas = [...this.impresoras];
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

    // 4. Llamada al servicio
    this.autoService.updateImpresoraSR(item._id, item).subscribe({
      next: (res: any) => {
        console.log('Mantenimiento SR guardado:', res);
        item.guardandoMantenimiento = false;
      },
      error: (err: any) => {
        console.error('Error al actualizar mantenimiento SR:', err);
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

      this.autoService.updateImpresoraSR(item._id, item).subscribe({
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

  // ==========================================
  // --- TRÁMITE DE BAJA DE IMPRESORAS ---
  // ==========================================

  abrirModalBaja(equipo: any) {
    this.equipoSeleccionados = equipo;
    this.archivoBaja = null; // Limpiar archivo previo si lo hay

    // CORRECCIÓN: Reseteamos también el campo "documento"
    this.datosBaja = {
      motivo: '',
      informe: '',
      observacion: '',
      fecha: new Date().toISOString().substring(0, 10),
      documento: null
    };
  }

  // CORRECCIÓN: Lógica para convertir a Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo es demasiado pesado. Por favor, sube un PDF o imagen menor a 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.datosBaja.documento = reader.result as string;
        console.log('Archivo procesado exitosamente para el envío.');
      };
      reader.onerror = (error) => {
        console.error('Error al procesar el archivo: ', error);
      };
    }
  }

  // Envía los datos al Backend (Formato JSON compatible)
  confirmarBaja() {
    if (!this.datosBaja.motivo || !this.datosBaja.observacion) {
      alert('El motivo y la observación técnica son obligatorios.');
      return;
    }

    // Al ser una impresora, siempre se da de baja el equipo completo
    let actualizacionBaja = {
      estadoFisico: 'De Baja',
      datosBajaTecnica: this.datosBaja
    };

    // Usamos updateImpresoraSR para apuntar a la base de Sitios Remotos
    this.autoService.updateImpresoraSR(this.equipoSeleccionados._id, actualizacionBaja).subscribe({
      next: (respuesta: any) => {
        console.log('RESPUESTA DEL SERVIDOR:', respuesta);

        // 1. Cerramos el modal de Bootstrap de forma segura
        const modalElement = document.getElementById('modalBaja');
        if (modalElement) {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.getElementsByClassName('modal-backdrop');
          while (backdrop.length > 0) {
            backdrop[0].parentNode?.removeChild(backdrop[0]);
          }
        }

        // 2. ACTUALIZACIÓN LOCAL INMEDIATA EN LA TABLA
        // Quitamos la impresora del arreglo principal para que desaparezca al instante
        this.impresoras = this.impresoras.filter((e: any) => e._id !== this.equipoSeleccionados._id);

        // 3. Forzamos a Angular a redibujar la tabla
        this.impresorasFiltradas = [];
        setTimeout(() => {
          this.impresorasFiltradas = [...this.impresoras];
        }, 30);

        alert('Impresora remota dada de baja correctamente.');

        // 4. Recargamos los datos del servidor para asegurar sincronización
        this.obtenerImpresoras();
      },
      error: (error) => {
        console.error('Error al procesar la baja de la impresora:', error);
        alert('Hubo un error al procesar el trámite en el servidor.');
      }
    });
  }
}
