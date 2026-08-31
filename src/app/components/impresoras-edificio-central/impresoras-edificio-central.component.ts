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

  // --- VARIABLES PARA EL TRÁMITE DE BAJA ---
  equipoSeleccionados: any = null;
  archivoBaja: File | null = null;

  // CORRECCIÓN 1: Le agregamos ": any" para que permita guardar el texto Base64
  datosBaja: any = {
    motivo: '',
    informe: '',
    observacion: '',
    fecha: new Date().toISOString().substring(0, 10),
    documento: null // Aquí guardaremos el archivo convertido
  };

  // Inyectamos el servicio en lugar de HttpClient directo
  constructor(private autoService: AutoServiceService) {}

  ngOnInit() {
    this.obtenerImpresoras();
  }

  obtenerImpresoras() {
    this.autoService.getImpresorasEC().subscribe(data => {
      // Filtramos para que NO se muestren las impresoras que ya fueron dadas de baja
      this.impresoras = data.filter((item: any) => item.estadoFisico !== 'De Baja');
      this.impresorasFiltradas = [...this.impresoras];
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
  // --- MANTENIMIENTO DE IMPRESORAS ---
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

  // ==========================================
  // --- TRÁMITE DE BAJA DE IMPRESORAS ---
  // ==========================================

  abrirModalBaja(equipo: any) {
    this.equipoSeleccionados = equipo;
    this.archivoBaja = null; // Limpiar archivo previo si lo hay

    // CORRECCIÓN 2: Aseguramos que el documento se limpie al abrir
    this.datosBaja = {
      motivo: '',
      informe: '',
      observacion: '',
      fecha: new Date().toISOString().substring(0, 10),
      documento: null
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Recomendación: Limitar el tamaño a 2MB para no saturar MongoDB
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo es demasiado pesado. Por favor, sube un PDF o imagen menor a 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Convierte el archivo a una cadena de texto (Base64) y lo guarda en el JSON
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

    // Usamos updateImpresoraEC para apuntar a la base de Edificio Central
    this.autoService.updateImpresoraEC(this.equipoSeleccionados._id, actualizacionBaja).subscribe({
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

        alert('Impresora dada de baja correctamente.');

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
