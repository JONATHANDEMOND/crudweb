import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AutoServiceService } from '../service/auto-service.service';

@Component({
  selector: 'app-proyectores-sr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proyectores-sr.component.html',
  styleUrls: ['./proyectores-sr.component.css']
})
export class ProyectoresSrComponent implements OnInit {
  servicio = inject(AutoServiceService);

  equipos: any[] = [];
  vehiculosFiltrados: any[] = [];
  busquedaGlobal: string = '';

  mostrarModalRegistro = false;
  modoEdicion = false;

  equipoSeleccionado: any = null; // Solo para Ficha Técnica
  equipoParaBaja: any = null;     // Solo para Trámite de Baja

  // Campos del formulario de registro
  id: string = '';
  usuario: string = '';
  dependencia: string = '';
  modelo: string = '';
  marca: string = '';
  codigoBien: string = '';
  numeroSerie: string = '';
  estado: string = 'Bueno';

  datosBaja: any = {
    componente: 'Completo',
    nuevoCodigo: '',
    nuevaSerie: '',
    motivo: '',
    informe: '',
    observacion: '',
    fecha: new Date().toISOString().substring(0, 10),
    archivo: null
  };

  archivoBaja: File | null = null;

  ngOnInit() {
    this.cargarDatos();
  }

  // CARGAR DATOS CON FILTRO ESTRICTO DE BAJAS
  cargarDatos() {
    this.servicio.getProyectoresSR().subscribe({
      next: (res: any) => {
        const todosLosEquipos = res.data || res;
        this.equipos = todosLosEquipos;

        this.vehiculosFiltrados = this.equipos.filter((e: any) => {
          const estadoStr = (e.estado || '').toLowerCase();
          const fisicoStr = (e.estadoFisico || '').toLowerCase();
          const estaBaja = estadoStr.includes('baja') || fisicoStr.includes('de baja');
          return !estaBaja;
        });
      },
      error: (err: any) => console.error("Error al cargar datos:", err)
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
    const termino = this.busquedaGlobal.toLowerCase();
    this.vehiculosFiltrados = this.equipos.filter(item => {
      const estadoStr = (item.estado || '').toLowerCase();
      const fisicoStr = (item.estadoFisico || '').toLowerCase();
      const estaBaja = estadoStr.includes('baja') || fisicoStr.includes('de baja');
      if (estaBaja) return false;

      return Object.values(item).some(val =>
        val !== null && val !== undefined &&
        String(val).toLowerCase().includes(termino)
      );
    });
  }

  abrirModalRegistro(item?: any) {
    if (item) {
      this.modoEdicion = true;
      this.id = item._id;
      this.usuario = item.usuario || '';
      this.dependencia = item.dependencia || '';
      this.modelo = item.modelo || '';
      this.marca = item.marca || '';
      this.codigoBien = item.codigoBien || '';
      this.numeroSerie = item.numeroSerie || '';
      this.estado = item.estado || 'Bueno';
    } else {
      this.modoEdicion = false;
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
      this.servicio.updateProyectorSR(idParaEditar, cuerpo).subscribe({
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
      this.servicio.createProyectorSR(cuerpo).subscribe({
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
      this.servicio.deleteProyectorSR(id).subscribe({
        next: () => {
          this.equipos = this.equipos.filter(e => e._id !== id);
          this.filtrarEquipos();
        },
        error: (err) => console.error("Error:", err)
      });
    }
  }

  guardandoMantenimiento: boolean = false;

  marcarMantenimiento(item: any) {
    if (!item._id) {
      alert('Este equipo no tiene un ID sincronizado.');
      return;
    }

    const estadoSwitchAnterior = !item.mantenimientoRealizado;
    const historialAnterior = [...(item.historialMantenimientos || [])];

    if (!item.historialMantenimientos) {
      item.historialMantenimientos = [];
    }

    const fechaActual = new Date();
    if (item.mantenimientoRealizado) {
      item.fechaUltimoMantenimiento = fechaActual;
      item.historialMantenimientos.unshift({ fecha: fechaActual });
    } else {
      item.fechaUltimoMantenimiento = null;
    }

    this.servicio.updateProyectorSR(item._id, item).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Error al actualizar el estado:', err);
        item.mantenimientoRealizado = estadoSwitchAnterior;
        item.historialMantenimientos = historialAnterior;
        alert('Error de conexión al guardar el mantenimiento.');
      }
    });
  }

  limpiarMantenimiento(item: any) {
    if (!item._id) return;

    if (confirm('¿Está seguro de que desea limpiar todo el historial de mantenimiento?')) {
      item.mantenimientoRealizado = false;
      item.fechaUltimoMantenimiento = null;
      item.historialMantenimientos = [];

      this.servicio.updateProyectorSR(item._id, item).subscribe({
        next: () => {
          this.equipoSeleccionado = null;
          this.cargarDatos();
        },
        error: () => {
          alert("No se pudo limpiar el mantenimiento. Intente nuevamente.");
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
      fecha: new Date().toISOString().substring(0, 10),
      archivo: null
    };
  }

  confirmarBaja() {
    if (!this.datosBaja.motivo || !this.datosBaja.observacion || !this.datosBaja.componente) {
      alert("El componente, motivo y observación son obligatorios.");
      return;
    }

    if (!this.equipoParaBaja || !this.equipoParaBaja._id) {
      alert("No hay ningún equipo seleccionado o falta el identificador (ID).");
      return;
    }

    if (this.archivoBaja) {
      const reader = new FileReader();
      reader.readAsDataURL(this.archivoBaja);
      reader.onload = () => {
        this.datosBaja.archivo = reader.result;
        this.ejecutarGuardadoBaja();
      };
      reader.onerror = () => {
        alert("Error al procesar el archivo adjunto.");
      };
    } else {
      this.ejecutarGuardadoBaja();
    }
  }

  private ejecutarGuardadoBaja() {
    const cuerpoBaja = {
      ...this.equipoParaBaja,
      estadoFisico: 'De Baja',
      estado: 'Baja',
      datosBajaTecnica: this.datosBaja
    };

    const idBaja = this.equipoParaBaja._id;

    this.servicio.updateProyectorSR(idBaja, cuerpoBaja).subscribe({
      next: () => {
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

        this.equipos = this.equipos.map(e => {
          if (e._id === idBaja) {
            return { ...e, estado: 'Baja', estadoFisico: 'De Baja' };
          }
          return e;
        });

        this.filtrarEquipos();
        this.equipoParaBaja = null;
        this.archivoBaja = null;
        alert("Trámite de baja procesado correctamente.");

        setTimeout(() => {
          this.cargarDatos();
        }, 100);
      },
      error: (err: any) => {
        console.error("Error al procesar la baja:", err);
        alert("No se pudo registrar la baja del equipo.");
      }
    });
  }

  trackById(index: number, item: any): string {
    return item._id;
  }
}
