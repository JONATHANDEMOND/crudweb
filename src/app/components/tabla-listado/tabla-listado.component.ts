import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../../service/auto-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-listado',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './tabla-listado.component.html',
  styleUrl: './tabla-listado.component.css'
})
export class TablaListadoComponent implements OnInit {
  servicio = inject(AutoServiceService);

  edificioCentral: any[] = [];
  vehiculosFiltrados: any[] = [];
  busquedaGlobal: string = ''; // Nueva variable para el buscador universal

  equipoSeleccionado: any = null;
  mostrarModalRegistro: boolean = false;
  modoEdicion: boolean = false; // NUEVA VARIABLE PARA CONTROLAR EDICIÓN

  equipoSeleccionados: any = null;
  datosBaja = {
    componente: 'Completo',
    motivo: '',
    informe: '',
    observacion: '',
    nuevoCodigo: '', // <--- NUEVO
    nuevaSerie: '',
    fecha: new Date().toISOString().substring(0, 10) // Fecha de hoy por defecto
  };
  fechaActual = new Date();
  tecnicoLogeado: string = '';
  archivoBaja: File | null = null;
  busquedaCodigo: string = '';
  busquedaUsuario: string = '';

  id: any = ''; usuario: any = ''; dependencia: any = ''; hostname: any = '';
  tipo: any = ''; modelo: any = ''; codigoBien: any = ''; numeroSerie: any = '';
  codigoBienMonitor: any = ''; numeroSerieMonitor: any = '';
  codigoBienMonitor2: any = ''; numeroSerieMonitor2: any = ''; // <--- NUEVO MONITOR 2
  codigoBienMouse: any = ''; numeroSerieMouse: any = '';
  codigoBienTeclado: any = ''; numeroSerieTeclado: any = '';
  codigoBienUps: any = ''; numeroSerieUps: any = ''; estadoups: any = ''; tipoDisco: any = ''; procesador: any = '';
  observaciones: any = ''; // <--- NUEVA OBSERVACIÓN GENERAL

  ngOnInit() {
    this.cargarDatos();
    this.cargarTecnico();
  }

  cargarDatos() {
    this.servicio.getEdificioCentral().subscribe({
      next: (edificio) => {
        // 1. Filtramos: Nos quedamos SOLO con los que NO estén de baja
        this.edificioCentral = edificio.filter((equipo: any) => equipo.estadoFisico !== 'De Baja');

        // 2. Actualizamos la lista que se muestra en la tabla
        this.vehiculosFiltrados = [...this.edificioCentral];
      },
      error: (err) => {
        console.error('Error al cargar los datos de Edificio Central:', err);
      }
    });
  }

  cargarTecnico() {
    const log = localStorage.getItem('login');
    if (log) {
      try {
        const usuarioObj = JSON.parse(log);
        this.tecnicoLogeado = usuarioObj.nombre || usuarioObj.usuario || 'Técnico CIRST';
      } catch (e) { this.tecnicoLogeado = 'Técnico CIRST'; }
    } else { this.tecnicoLogeado = 'Técnico CIRST'; }
  }


  //BUSQUEDA GLOBAL: Filtra por cualquier campo relevante//

  filtrarEquipos() {
    // Si no hay texto, mostramos todos
    if (!this.busquedaGlobal.trim()) {
      this.vehiculosFiltrados = [...this.edificioCentral];
      return;
    }

    const term = this.busquedaGlobal.toLowerCase();

    this.vehiculosFiltrados = this.edificioCentral.filter(item => {
      // Object.values(item) toma todos los datos del equipo y los convierte en un array
      // .some() verifica si AL MENOS UNO de esos datos contiene lo que escribiste
      return Object.values(item).some(val =>
        val !== null && val !== undefined &&
        String(val).toLowerCase().includes(term)
      );
    });
  }

  // --- MODAL DETALLES ---
  abrirDetalles(item: any) {
    this.equipoSeleccionado = item;
  }

  // --- MODAL REGISTRO / EDICIÓN ---
  abrirModalRegistro(item: any = null) {
    if (item) {
      this.modoEdicion = true;
      this.cargarEnFormulario(item);
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

  cargarEnFormulario(item: any) {
    this.id = item._id; // <--- CAPTURA EL _ID DE MONGO
    this.usuario = item.usuario;
    this.dependencia = item.dependencia;
    this.hostname = item.hostname;
    this.tipo = item.tipo;
    this.procesador = item.procesador;
    this.modelo = item.modelo;
    this.codigoBien = item.codigoBien;
    this.numeroSerie = item.numeroSerie;
    this.codigoBienMonitor = item.codigoBienMonitor;
    this.numeroSerieMonitor = item.numeroSerieMonitor;
    this.codigoBienMonitor2 = item.codigoBienMonitor2;     // <--- CARGAR MONITOR 2
    this.numeroSerieMonitor2 = item.numeroSerieMonitor2;   // <--- CARGAR SERIE MONITOR 2
    this.codigoBienMouse = item.codigoBienMouse;
    this.numeroSerieMouse = item.numeroSerieMouse;
    this.codigoBienTeclado = item.codigoBienTeclado;
    this.numeroSerieTeclado = item.numeroSerieTeclado;
    this.codigoBienUps = item.codigoBienUps;
    this.numeroSerieUps = item.numeroSerieUps;
    this.estadoups = item.estadoups;
    this.tipoDisco = item.tipoDisco;
    this.observaciones = item.observaciones;                // <--- CARGAR OBSERVACIÓN
  }

  guardar(formulario: any) {
    const datos = formulario.value;

    console.log('Modo edición:', this.modoEdicion);
    console.log('ID actual:', this.id);
    console.log('Datos del formulario:', datos);

    if (this.modoEdicion) {
      if (!this.id) {
        alert("❌ Error: No se encontró el ID del equipo para actualizar.");
        return;
      }

      this.servicio.updateEdificioCentral(this.id, datos).subscribe({
        next: (respuesta) => {
          alert("✅ Equipo actualizado correctamente");
          this.cerrarModalRegistro();
          this.cargarDatos();
        },
        error: (err) => {
          console.error("Error al actualizar:", err);
          alert("❌ Ocurrió un error al intentar actualizar. Revisa la consola.");
        }
      });
    } else {
      const idsExistentes = this.edificioCentral.map(a => Number(a.id) || 0);
      const maxId = idsExistentes.length > 0 ? Math.max(...idsExistentes) : 0;

      datos.id = (maxId + 1).toString();

      this.servicio.postEdificioCentral(datos).subscribe({
        next: (respuesta) => {
          alert("✅ Equipo registrado con ID: " + datos.id);
          this.cerrarModalRegistro();
          this.cargarDatos();
        },
        error: (err) => {
          console.error("Error al guardar:", err);
          alert("❌ Ocurrió un error al intentar guardar.");
        }
      });
    }
  }

  limpiarFormulario() {
    this.id = ''; this.usuario = ''; this.dependencia = ''; this.hostname = '';
    this.tipo = ''; this.modelo = ''; this.codigoBien = ''; this.numeroSerie = '';
    this.codigoBienMonitor = ''; this.numeroSerieMonitor = '';
    this.codigoBienMonitor2 = ''; this.numeroSerieMonitor2 = ''; // <--- LIMPIAR MONITOR 2
    this.codigoBienMouse = ''; this.numeroSerieMouse = '';
    this.codigoBienTeclado = ''; this.numeroSerieTeclado = '';
    this.codigoBienUps = ''; this.numeroSerieUps = ''; this.estadoups = ''; this.tipoDisco = '';
    this.procesador = '';
    this.observaciones = ''; // <--- LIMPIAR OBSERVACIÓN
  }

  // --- RESTO DE FUNCIONES (ELIMINAR, FILTRAR, ETIQUETA) ---
  eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.servicio.deleteEdificioCentral(id).subscribe(() => {
        this.edificioCentral = this.edificioCentral.filter(aut => aut._id !== id);
        this.filtrarEquipos();
      });
    }
  }

  abrirModalBaja(equipo: any) {
    this.equipoSeleccionados = equipo;
    this.datosBaja = {
      componente: 'Completo',
      motivo: '',
      informe: '',
      observacion: '',
      nuevoCodigo: '',
      nuevaSerie: '',
      fecha: new Date().toISOString().substring(0, 10)
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoBaja = file;
      console.log('Archivo adjunto seleccionado:', file.name);
    }
  }

  confirmarBaja() {
    if (!this.datosBaja.motivo || !this.datosBaja.observacion || !this.datosBaja.componente) {
      alert('El componente, motivo y observación son obligatorios.');
      return;
    }

    let actualizacionBaja: any = {};
    const nuevoCod = this.datosBaja.nuevoCodigo || 'S/N';
    const nuevaSer = this.datosBaja.nuevaSerie || 'S/N';

    if (this.datosBaja.componente === 'Completo') {
      actualizacionBaja.estadoFisico = 'De Baja';
      actualizacionBaja.datosBajaTecnica = this.datosBaja;
    } else {
      actualizacionBaja[`historialBaja${this.datosBaja.componente}`] = this.datosBaja;

      if (this.datosBaja.componente === 'Monitor') {
        actualizacionBaja.codigoBienMonitor = nuevoCod;
        actualizacionBaja.numeroSerieMonitor = nuevaSer;
      } else if (this.datosBaja.componente === 'Teclado') {
        actualizacionBaja.codigoBienTeclado = nuevoCod;
        actualizacionBaja.numeroSerieTeclado = nuevaSer;
      } else if (this.datosBaja.componente === 'Mouse') {
        actualizacionBaja.codigoBienMouse = nuevoCod;
        actualizacionBaja.numeroSerieMouse = nuevaSer;
      } else if (this.datosBaja.componente === 'UPS') {
        actualizacionBaja.codigoBienUps = nuevoCod;
        actualizacionBaja.numeroSerieUps = nuevaSer;
        actualizacionBaja.estadoups = 'Bueno';
      }
    }

    this.servicio.updateEdificioCentral(this.equipoSeleccionados._id, actualizacionBaja).subscribe({
      next: (respuesta: any) => {
        console.log('RESPUESTA DEL SERVIDOR:', respuesta);

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

        if (this.datosBaja.componente === 'Completo') {
          this.edificioCentral = this.edificioCentral.filter((e: any) => e._id !== this.equipoSeleccionados._id);
        } else {
          const index = this.edificioCentral.findIndex((e: any) => e._id === this.equipoSeleccionados._id);
          if (index !== -1) {
            if (this.datosBaja.componente === 'Monitor') {
              this.edificioCentral[index].codigoBienMonitor = nuevoCod;
              this.edificioCentral[index].numeroSerieMonitor = nuevaSer;
            } else if (this.datosBaja.componente === 'Teclado') {
              this.edificioCentral[index].codigoBienTeclado = nuevoCod;
              this.edificioCentral[index].numeroSerieTeclado = nuevaSer;
            } else if (this.datosBaja.componente === 'Mouse') {
              this.edificioCentral[index].codigoBienMouse = nuevoCod;
              this.edificioCentral[index].numeroSerieMouse = nuevaSer;
            } else if (this.datosBaja.componente === 'UPS') {
              this.edificioCentral[index].codigoBienUps = nuevoCod;
              this.edificioCentral[index].numeroSerieUps = nuevaSer;
              this.edificioCentral[index].estadoups = 'Bueno';
            }
          }
        }

        this.vehiculosFiltrados = [];
        setTimeout(() => {
          this.vehiculosFiltrados = [...this.edificioCentral];
        }, 30);

        alert('Trámite de baja procesado y actualizado correctamente.');
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al procesar la baja:', error);
        alert('Hubo un error al procesar el trámite en el servidor.');
      }
    });
  }

  filtrarEquiposs2() { }
  trackById(index: number, item: any) { return item.id; }
  contarUpsMalos() { return this.vehiculosFiltrados.filter(x => x.estadoups === 'Malo').length; }
  contarUsuarios() { const usuarios = new Set(this.vehiculosFiltrados.map(x => x.usuario)); return usuarios.size; }
  contarSSD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'SSD').length; }
  contarM2() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'M2').length; }
  contarHDD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'HDD').length; }

  marcarMantenimiento(equipo: any) {
    if (!equipo._id) {
      alert('Este equipo es nuevo y aún no se ha sincronizado su ID. Por favor, recarga la página e intenta de nuevo.');
      setTimeout(() => equipo.mantenimientoRealizado = !equipo.mantenimientoRealizado, 100);
      return;
    }

    equipo.guardandoMantenimiento = true;

    if (!equipo.historialMantenimientos) {
      equipo.historialMantenimientos = [];
    }

    const estadoSwitchAnterior = !equipo.mantenimientoRealizado;
    const historialAnterior = [...equipo.historialMantenimientos];
    const fechaPlanaAnterior = equipo.fechaUltimoMantenimiento;

    if (equipo.mantenimientoRealizado) {
      const nuevaFecha = new Date().toISOString();
      equipo.historialMantenimientos.push({ fecha: nuevaFecha });
      equipo.fechaUltimoMantenimiento = nuevaFecha;
    } else {
      equipo.fechaUltimoMantenimiento = null;
    }

    this.servicio.updateEdificioCentral(equipo._id, equipo).subscribe({
      next: (res: any) => {
        console.log('Mantenimiento guardado con éxito:', res);
        equipo.guardandoMantenimiento = false;
      },
      error: (err: any) => {
        console.error('ERROR AL GUARDAR MANTENIMIENTO:', err);
        equipo.mantenimientoRealizado = estadoSwitchAnterior;
        equipo.historialMantenimientos = historialAnterior;
        equipo.fechaUltimoMantenimiento = fechaPlanaAnterior;
        equipo.guardandoMantenimiento = false;
        alert('Error de conexión al guardar el mantenimiento.');
      }
    });
  }
  limpiarMantenimiento(equipo: any) {
    if (!equipo._id) {
      alert('Error: El equipo no tiene un ID válido. Recarga la página.');
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar todo el historial y estado de mantenimiento de este equipo?')) {
      equipo.guardandoMantenimiento = true;

      equipo.mantenimientoRealizado = false;
      equipo.fechaUltimoMantenimiento = null;
      equipo.historialMantenimientos = [];

      this.servicio.updateEdificioCentral(equipo._id, equipo).subscribe({
        next: (res: any) => {
          console.log('Mantenimiento limpiado exitosamente');
          equipo.guardandoMantenimiento = false;
        },
        error: (err: any) => {
          console.error('Error al limpiar el mantenimiento', err);
          equipo.guardandoMantenimiento = false;
          alert('No se pudo limpiar el mantenimiento. Intente de nuevo.');
        }
      });
    }
  }

imprimirEtiqueta(equipo: any) {

  const fechaHoy = new Date().toLocaleDateString('es-EC');

  const fechaManual = prompt(
    'Ingrese la fecha para la etiqueta:',
    fechaHoy
  );

  if (fechaManual === null) return;

  const codigoBien = equipo.codigoBien || '';
  const tipo = equipo.tipo || 'ESCRITORIO';
  const ubicacion = equipo.dependencia || '';
  const tecnico = (this.tecnicoLogeado || '').toUpperCase();


  // ==========================================
  // ELIMINAR IFRAME ANTERIOR
  // ==========================================

  const iframeAnterior = document.getElementById(
    'iframe-etiqueta-impresion'
  );

  if (iframeAnterior) {
    iframeAnterior.remove();
  }


  // ==========================================
  // CREAR IFRAME
  // ==========================================

  const iframe = document.createElement('iframe');

  iframe.id = 'iframe-etiqueta-impresion';

  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);


  const doc = iframe.contentWindow?.document;

  if (!doc) {

    alert('No se pudo preparar la impresión.');

    iframe.remove();

    return;
  }


  // ==========================================
  // ESCAPAR HTML
  // ==========================================

  const escapeHtml = (texto: any): string => {

    return String(texto ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  };


  const codigo = escapeHtml(codigoBien);
  const tipoSeguro = escapeHtml(tipo);
  const ubicacionSegura = escapeHtml(ubicacion);
  const tecnicoSeguro = escapeHtml(tecnico);
  const fechaSegura = escapeHtml(fechaManual);


  // ==========================================
  // DOCUMENTO
  // ==========================================

  doc.open();

  doc.write(`

    <!DOCTYPE html>

    <html lang="es">

    <head>

      <meta charset="UTF-8">

      <title>Etiqueta ${codigo}</title>


      <style>

        /* ================================================
           PAPEL
           ================================================ */

        @page {

          size: 76mm 39mm;

          margin: 0;

        }


        * {

          box-sizing: border-box;

        }


        html,
        body {

          margin: 0;

          padding: 0;

          width: 76mm;

          height: 39mm;

          overflow: hidden;

          background: white;

        }


        body {

          font-family: Arial, Helvetica, sans-serif;

          -webkit-print-color-adjust: exact;

          print-color-adjust: exact;

        }


        /* ================================================
           CONTENEDOR GENERAL

           TODO EL CONTENIDO SE REDUCE AL 80 %
           ================================================ */

        .etiqueta {

          position: absolute;

          left: 2mm;

          top: 1mm;

          width: 90mm;

          height: 46mm;

          transform: scale(0.80);

          transform-origin: top left;

          overflow: hidden;

        }


        /* ================================================
           ENCABEZADO
           ================================================ */

        .header {

          width: 90mm;

          height: 7mm;

          text-align: center;

          border-bottom: 0.25mm solid #000;

          padding: 0;

        }


        .header h1 {

          margin: 0;

          padding: 0;

          font-size: 7pt;

          line-height: 7pt;

          font-weight: bold;

        }


        .header p {

          margin: 0.3mm 0 0 0;

          padding: 0;

          font-size: 4.2pt;

          line-height: 4.2pt;

          font-weight: bold;

          white-space: nowrap;

        }


        /* ================================================
           DATOS
           ================================================ */

        .datos {

          width: 90mm;

          padding-top: 0.8mm;

        }

.fila {

  width: 90mm;

  height: 4.2mm;

  display: flex;

  align-items: center;

  font-size: 5.5pt;

  line-height: 3.8mm;

  margin: 0;

  /* MOVER DATOS HACIA LA DERECHA */
  padding-left: 8mm;
}


        /* ================================================
           CAMPOS

           Dejamos espacio suficiente para:
           BIEN:
           TIPO:
           UBICACIÓN:
           ================================================ */

        .campo {

  width: 23mm;
  min-width: 23mm;

  flex-shrink: 0;

  font-weight: bold;

  white-space: nowrap;
}


       .valor {

  width: 62mm;

  max-width: 62mm;

  margin-left: -6mm;

  font-weight: normal;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}


        /* ================================================
           CÓDIGO
           ================================================ */

        .codigo {

          width: 90mm;

          height: 5mm;

          margin-top: 0.3mm;

          text-align: center;

          font-size: 6.5pt;

          line-height: 5mm;

          font-weight: bold;

          white-space: nowrap;

          overflow: hidden;

        }


        /* ================================================
           PIE
           ================================================ */

        .pie {

          width: 90mm;

          height: 5mm;

          border-top: 0.25mm solid #000;

          border-bottom: 0.25mm solid #000;

          display: flex;

          align-items: center;

          padding: 0 1mm;

          font-size: 4.8pt;

          line-height: 4.5mm;

          font-weight: bold;

        }


        .tecnico {

  width: 50mm;

  margin-left: 8mm;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}


    .fecha {

  width: 25mm;

  margin-left: 5mm;

  text-align: left;

  white-space: nowrap;
}


        /* ================================================
           CONTROL
           ================================================ */

        .control {

          width: 90mm;

          height: 4.5mm;

          display: flex;

          align-items: center;

          justify-content: center;

          text-align: center;

          font-size: 4.8pt;

          line-height: 4mm;

          font-weight: bold;

          white-space: nowrap;

          overflow: hidden;

        }


        /* ================================================
           IMPRESIÓN
           ================================================ */

        @media print {

          html,
          body {

            width: 76mm;

            height: 39mm;

            margin: 0;

            padding: 0;

            overflow: hidden;

          }


          .etiqueta {

            left: 2mm;

            top: 1mm;

          }

        }

      </style>

    </head>


    <body>


      <div class="etiqueta">


        <!-- =========================================
             ENCABEZADO
             ========================================= -->

        <div class="header">

          <h1>CIRST</h1>

          <p>
            PREFECTURA DE PICHINCHA - SOPORTE TÉCNICO
          </p>

        </div>


        <!-- =========================================
             INFORMACIÓN
             ========================================= -->

        <div class="datos">


          <div class="fila">

            <span class="campo">
              BIEN:
            </span>

            <span class="valor">
              ${codigo}
            </span>

          </div>


          <div class="fila">

            <span class="campo">
              TIPO:
            </span>

            <span class="valor">
              ${tipoSeguro}
            </span>

          </div>


          <div class="fila">

            <span class="campo">
              UBICACIÓN:
            </span>

            <span class="valor">
              ${ubicacionSegura}
            </span>

          </div>


        </div>


        <!-- =========================================
             CÓDIGO
             ========================================= -->

        <div class="codigo">

           ${codigo}

        </div>


        <!-- =========================================
             TÉCNICO Y FECHA
             ========================================= -->

        <div class="pie">

          <span class="tecnico">
            TÉC: ${tecnicoSeguro}
          </span>

          <span class="fecha">
            ${fechaSegura}
          </span>

        </div>


        <!-- =========================================
             CONTROL
             ========================================= -->

        <div class="control">

          CONTROL MANTENIMIENTO-CIRST

        </div>


      </div>


    </body>

    </html>

  `);

  doc.close();


  // ==========================================
  // IMPRIMIR
  // ==========================================

  iframe.onload = () => {

    setTimeout(() => {

      iframe.contentWindow?.focus();

      iframe.contentWindow?.print();

    }, 500);

  };


  // ==========================================
  // ELIMINAR IFRAME
  // ==========================================

  iframe.contentWindow?.addEventListener(
    'afterprint',
    () => {

      setTimeout(() => {

        iframe.remove();

      }, 500);

    }
  );

}
}
