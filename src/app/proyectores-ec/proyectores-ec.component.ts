import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AutoServiceService } from '../service/auto-service.service';

@Component({
  selector: 'app-proyectores-ec',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proyectores-ec.component.html',
  styleUrls: ['./proyectores-ec.component.css']
})
export class ProyectoresEcComponent implements OnInit {
  servicio = inject(AutoServiceService);

  equipos: any[] = [];
  vehiculosFiltrados: any[] = [];
  busquedaGlobal: string = '';

  mostrarModalRegistro = false;
  modoEdicion = false;

  equipoSeleccionado: any = null;
  equipoParaBaja: any = null;

  // Campos del formulario
  id: string = '';
  usuario: string = '';
  dependencia: string = '';
  modelo: string = '';
  marca: string = '';
  codigoBien: string = '';
  numeroSerie: string = '';
  estado: string = 'Bueno';

  datosBaja = {
    componente: 'Completo',
    nuevoCodigo: '',
    nuevaSerie: '',
    motivo: '',
    informe: '',
    observacion: '',
    fecha: new Date().toISOString().substring(0, 10)
  };

  archivoBaja: File | null = null;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.servicio.getProyectoresEC().subscribe({
      next: (res: any) => {
        const todosLosEquipos = res.data || res;
        this.equipos = todosLosEquipos;

        // FILTRO ESTRICTO: Oculta cualquier variante de baja de la tabla principal
        this.vehiculosFiltrados = this.equipos.filter((e: any) => {
          const estadoStr = (e.estado || '').toLowerCase();
          const fisicoStr = (e.estadoFisico || '').toLowerCase();

          const estaBaja = estadoStr.includes('baja') || fisicoStr.includes('de baja');
          return !estaBaja; // Solo dejamos los que NO estén de baja
        });
      },
      error: (err: any) => console.error('Error al cargar datos', err)
    });
  }

  filtrarEquipos() {
    if (!this.busquedaGlobal.trim()) {
      this.vehiculosFiltrados = this.equipos.filter((e: any) => {
        const estadoStr = (e.estado || '').toLowerCase();
        const fisicoStr = (e.estadoFisico || '').toLowerCase();
        return !estadoStr.includes('baja') && !fisicoStr.includes('de baja');
      });
      return;
    }
    const term = this.busquedaGlobal.toLowerCase();
    this.vehiculosFiltrados = this.equipos.filter(item => {
      const estadoStr = (item.estado || '').toLowerCase();
      const fisicoStr = (item.estadoFisico || '').toLowerCase();
      const estaBaja = estadoStr.includes('baja') || fisicoStr.includes('de baja');
      if (estaBaja) return false;

      return Object.values(item).some(val =>
        val !== null && val !== undefined &&
        String(val).toLowerCase().includes(term)
      );
    });
  }

  abrirModalRegistro(item?: any) {
    if (item && item._id) {
      this.modoEdicion = true;
      this.id = item._id; // <--- Esto es vital para que Angular sepa que estás editando
      this.usuario = item.usuario || '';
      this.dependencia = item.dependencia || '';
      this.modelo = item.modelo || '';
      this.marca = item.marca || '';
      this.codigoBien = item.codigoBien || '';
      this.numeroSerie = item.numeroSerie || '';
      this.estado = item.estado || 'Bueno';
    } else {
      this.modoEdicion = false;
      this.id = '';
      this.limpiarFormulario();
    }
    this.mostrarModalRegistro = true;
  }

  cerrarModalRegistro() {
    this.mostrarModalRegistro = false;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.id = '';
    this.usuario = '';
    this.dependencia = '';
    this.modelo = '';
    this.marca = '';
    this.codigoBien = '';
    this.numeroSerie = '';
    this.estado = 'Bueno';
  }

guardar(form: NgForm) {
    if (form.invalid) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const cuerpo: any = {
      usuario: this.usuario,
      dependencia: this.dependencia,
      modelo: this.modelo,
      marca: this.marca,
      codigoBien: this.codigoBien,
      numeroSerie: this.numeroSerie,
      estado: this.estado || 'Bueno'
    };

    // 1. CAPTURAMOS EL ESTADO EXACTO ANTES DE CERRAR EL MODAL Y LIMPIAR VARIABLES
    const esEdicion = this.modoEdicion;
    const idParaEditar = this.id;

    // 2. Ahora sí cerramos el modal de forma segura
    this.cerrarModalRegistro();

    // 3. Evaluamos usando las variables capturadas, no las del componente limpio
    if (esEdicion && idParaEditar) {
      this.servicio.updateProyectorEC(idParaEditar, cuerpo).subscribe({
        next: () => {
          alert("✅ Equipo actualizado correctamente");
          this.cargarDatos();
        },
        error: (err) => {
          console.error("Error al actualizar:", err);
          alert("❌ Ocurrió un error al intentar actualizar.");
        }
      });
    } else {
      this.servicio.createProyectorEC(cuerpo).subscribe({
        next: () => {
          alert("✅ Equipo registrado correctamente");
          this.cargarDatos();
        },
        error: (err) => {
          console.error("Error al registrar:", err);
          alert("❌ Ocurrió un error al intentar guardar.");
        }
      });
    }
  }
  eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.servicio.deleteProyectorEC(id).subscribe({
        next: () => {
          this.equipos = this.equipos.filter(e => e._id !== id);
          this.filtrarEquipos();
        },
        error: (err) => console.error("Error al eliminar:", err)
      });
    }
  }

  marcarMantenimiento(equipo: any) {
    if (!equipo._id) {
      alert('Este equipo no tiene un ID sincronizado.');
      return;
    }

    equipo.guardandoMantenimiento = true;
    const estadoSwitchAnterior = !equipo.mantenimientoRealizado;
    const historialAnterior = [...(equipo.historialMantenimientos || [])];

    if (!equipo.historialMantenimientos) {
      equipo.historialMantenimientos = [];
    }

    if (equipo.mantenimientoRealizado) {
      const nuevaFecha = new Date().toISOString();
      equipo.historialMantenimientos.push({ fecha: nuevaFecha });
      equipo.fechaUltimoMantenimiento = nuevaFecha;
    } else {
      equipo.fechaUltimoMantenimiento = null;
    }

    this.servicio.updateProyectorEC(equipo._id, equipo).subscribe({
      next: () => {
        equipo.guardandoMantenimiento = false;
      },
      error: (err: any) => {
        console.error('ERROR AL GUARDAR MANTENIMIENTO:', err);
        equipo.mantenimientoRealizado = estadoSwitchAnterior;
        equipo.historialMantenimientos = historialAnterior;
        equipo.guardandoMantenimiento = false;
        alert('Error de conexión al guardar el mantenimiento.');
      }
    });
  }

limpiarMantenimiento(item?: any) {
    const equipoAClear = item || this.equipoSeleccionado;

    if (!equipoAClear || !equipoAClear._id) {
      alert("❌ Error: No se pudo identificar el ID del equipo.");
      return;
    }

    if (confirm('¿Está seguro de que desea limpiar todo el historial y estado de mantenimiento de este equipo?')) {

      // Forzamos los valores vacíos localmente en el objeto
      equipoAClear.mantenimientoRealizado = false;
      equipoAClear.fechaUltimoMantenimiento = null;
      equipoAClear.historialMantenimientos = [];

      // ⚠️ RECUERDA USAR EL SERVICIO ADECUADO SEGÚN EL MÓDULO:
      // (updateProyectorEC, updateProyectorSR, updateScannerEC, updateScannerSR)
      this.servicio.updateProyectorEC(equipoAClear._id, equipoAClear).subscribe({
        next: () => {
          // Cerramos los modales de Bootstrap de forma segura
          ['modalDetalles', 'modalFichaTecnica', 'detallesModal', 'fichaModal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
              el.classList.remove('show');
              el.style.display = 'none';
            }
          });

          document.body.classList.remove('modal-open');
          const backdrops = document.getElementsByClassName('modal-backdrop');
          while (backdrops.length > 0) {
            backdrops[0].parentNode?.removeChild(backdrops[0]);
          }

          this.equipoSeleccionado = null;

          alert("✅ Historial de mantenimiento limpiado correctamente.");
          this.cargarDatos();
        },
        error: (err) => {
          console.error("❌ Error al limpiar mantenimiento:", err);
          alert("❌ No se pudo limpiar el mantenimiento en el servidor.");
        }
      });
    }
  }

  imprimirEtiqueta(item: any) {
    alert(`Enviando etiqueta de ${item.codigoBien} a la impresora térmica...`);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoBaja = file;
    }
  }

  abrirDetalles(item: any) {
    this.equipoSeleccionado = item;
  }

  abrirModalBaja(item: any) {
    this.equipoParaBaja = item;
    this.archivoBaja = null;
    this.datosBaja = {
      componente: 'Completo',
      nuevoCodigo: '',
      nuevaSerie: '',
      motivo: '',
      informe: '',
      observacion: '',
      fecha: new Date().toISOString().substring(0, 10)
    };
  }

  confirmarBaja() {
    if (!this.datosBaja.motivo || !this.datosBaja.observacion || !this.datosBaja.componente) {
      alert('El componente, motivo y observación son obligatorios.');
      return;
    }

    if (!this.equipoParaBaja || !this.equipoParaBaja._id) {
      alert('No hay ningún equipo seleccionado.');
      return;
    }

    // Convertimos el archivo adjunto a Base64 de forma segura antes de enviar
    if (this.archivoBaja) {
      const reader = new FileReader();
      reader.readAsDataURL(this.archivoBaja);
      reader.onload = () => {
        (this.datosBaja as any).archivo = reader.result;
        this.ejecutarGuardadoBaja();
      };
      reader.onerror = () => {
        alert('Error al procesar el archivo adjunto.');
      };
    } else {
      this.ejecutarGuardadoBaja();
    }
  }

  private ejecutarGuardadoBaja() {
    const actualizacionBaja: any = {
      estadoFisico: 'De Baja',
      estado: 'Baja',
      datosBajaTecnica: this.datosBaja
    };

    this.servicio.updateProyectorEC(this.equipoParaBaja._id, actualizacionBaja).subscribe({
      next: () => {
        // Cerramos el modal de Bootstrap de forma segura
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

        // Actualización local inmediata asegurando que se marquen los campos de baja en memoria
        const idActual = this.equipoParaBaja._id;
        this.equipos = this.equipos.map(e => {
          if (e._id === idActual) {
            return { ...e, estado: 'Baja', estadoFisico: 'De Baja' };
          }
          return e;
        });

        this.filtrarEquipos();
        this.equipoParaBaja = null;
        alert('Trámite de baja procesado correctamente.');

        // Sincronización limpia con el servidor
        setTimeout(() => {
          this.cargarDatos();
        }, 100);
      },
      error: (error) => {
        console.error('Error al procesar la baja:', error);
        alert('Hubo un error al procesar el trámite en el servidor.');
      }
    });
  }

  trackById(index: number, item: any): string {
    return item._id;
  }
}
