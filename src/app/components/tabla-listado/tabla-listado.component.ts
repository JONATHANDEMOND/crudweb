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
  codigoBienMonitor: any = ''; numeroSerieMonitor: any = ''; codigoBienMouse: any = '';
  numeroSerieMouse: any = ''; codigoBienTeclado: any = ''; numeroSerieTeclado: any = '';
  codigoBienUps: any = ''; numeroSerieUps: any = ''; estadoups: any = ''; tipoDisco: any = '';procesador: any = '';

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
        this.tecnicoLogeado = usuarioObj.nombre || usuarioObj.usuario || 'Técnico CSTM';
      } catch (e) { this.tecnicoLogeado = 'Técnico CSTM'; }
    } else { this.tecnicoLogeado = 'Técnico CSTM'; }
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
    this.id = item._id;
    // <--- AGREGA ESTA LÍNEA PARA CAPTURAR EL _ID DE MONGO
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
    this.codigoBienMouse = item.codigoBienMouse;
    this.numeroSerieMouse = item.numeroSerieMouse;
    this.codigoBienTeclado = item.codigoBienTeclado;
    this.numeroSerieTeclado = item.numeroSerieTeclado;
    this.codigoBienUps = item.codigoBienUps;
    this.numeroSerieUps = item.numeroSerieUps;
    this.estadoups = item.estadoups;
    this.tipoDisco = item.tipoDisco;
  }

 guardar(formulario: any) {
    const datos = formulario.value;

    console.log('Modo edición:', this.modoEdicion);
    console.log('ID actual:', this.id); // Corregido a this.id
    console.log('Datos del formulario:', datos);

    if (this.modoEdicion) {
      // Usamos this.id porque así declaraste la variable arriba
      if (!this.id) {
        alert("❌ Error: No se encontró el ID del equipo para actualizar.");
        return;
      }

      // Enviamos la actualización con el this.id
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
      // SI ESTAMOS CREANDO
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
    this.codigoBienMonitor = ''; this.numeroSerieMonitor = ''; this.codigoBienMouse = '';
    this.numeroSerieMouse = ''; this.codigoBienTeclado = ''; this.numeroSerieTeclado = '';
    this.codigoBienUps = ''; this.numeroSerieUps = ''; this.estadoups = ''; this.tipoDisco = '';
    this.procesador = '';
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
  // Abre el modal y guarda temporalmente el equipo elegido
 abrirModalBaja(equipo: any) {
    this.equipoSeleccionados = equipo;
    // Reseteamos el formulario por si se abrió antes
    this.datosBaja = {
      componente: 'Completo',
      motivo: '',
      informe: '',
      observacion: '',
      nuevoCodigo: '', // <--- NUEVO
      nuevaSerie: '',
      fecha: new Date().toISOString().substring(0, 10)
    };
  }
///////////
onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoBaja = file;
      console.log('Archivo adjunto seleccionado:', file.name);
    }
  }
  // Envía los datos al Backend
// Envía los datos al Backend
  // Envía los datos al Backend para Edificio Central
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

    // Usamos updateEdificioCentral para apuntar a la ruta correcta de Edificio Central
    this.servicio.updateEdificioCentral(this.equipoSeleccionados._id, actualizacionBaja).subscribe({
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

        // 2. ACTUALIZACIÓN LOCAL INMEDIATA EN LA TABLA (Usando edificioCentral)
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

        // 3. Forzamos a Angular a redibujar la tabla
        this.vehiculosFiltrados = [];
        setTimeout(() => {
          this.vehiculosFiltrados = [...this.edificioCentral];
        }, 30);

        alert('Trámite de baja procesado y actualizado correctamente.');

        // 4. Recargamos los datos del servidor
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al procesar la baja:', error);
        alert('Hubo un error al procesar el trámite en el servidor.');
      }
    });
  }

  filtrarEquiposs2() { /* Tu código original */ }
  trackById(index: number, item: any) { return item.id; }
  contarUpsMalos() { return this.vehiculosFiltrados.filter(x => x.estadoups === 'Malo').length; }
  contarUsuarios() { const usuarios = new Set(this.vehiculosFiltrados.map(x => x.usuario)); return usuarios.size; }
  contarSSD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'SSD').length; }
  contarM2() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'M2').length; }
  contarHDD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'HDD').length; }
  // ----------------------------------------------------

  ///MARCAR EQUIPOS MANTENIMIENTO
marcarMantenimiento(equipo: any) {
    if (!equipo._id) {
      alert('Este equipo es nuevo y aún no se ha sincronizado su ID. Por favor, recarga la página e intenta de nuevo.');
      setTimeout(() => equipo.mantenimientoRealizado = !equipo.mantenimientoRealizado, 100);
      return;
    }

    equipo.guardandoMantenimiento = true;
    console.log("Enviando a Edificio Central ID:", equipo._id);

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

    // CORRECCIÓN CLAVE: Usamos updateEdificioCentral en lugar de actualizarEquipo
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

      // CORRECCIÓN CLAVE: Usamos updateEdificioCentral
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

  // ETIQUETAS
  // ----------------------------------------------------
  imprimirEtiqueta(equipo: any) {
    const fechaHoy = new Date().toLocaleDateString('es-EC');
    const fechaManual = prompt("Ingrese la fecha para la etiqueta:", fechaHoy);
    if (fechaManual === null) return;

    const WindowPrt = window.open('', '', 'width=400,height=300');
    if (WindowPrt) {
      WindowPrt.document.write(`
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <style>
          @page { size: 78mm 38mm; margin: 0; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
          body {
            width: 78mm; height: 38mm; margin: 0; padding: 0;
            font-family: 'Arial Narrow', Arial, sans-serif;
            position: relative; overflow: hidden; background: white;
          }
          .header { position: absolute; top: 0.5mm; left: -5mm; width: 100%; text-align: center; }
          .header h1 { margin: 0; font-size: 8.5pt; font-weight: bold; line-height: 0.7; }
          .header p { margin: 0.2mm 0 0 0; font-size: 3.5pt; font-weight: bold; border-bottom: 0.3px solid black; display: inline-block; width: 65%; padding-bottom: 0.1mm; line-height: 0.7; }
          .data-section { position: absolute; top: 4.5mm; left: 3mm; width: 62mm; }
          .row { display: flex; font-size: 5.2pt; line-height: 0.85; margin-bottom: 0.2mm; }
          .label { font-weight: bold; width: 11mm; color: #000; }
          .val { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: normal; }
          .barcode-container { position: absolute; top: 10.5mm; left: -5mm; width: 100%; text-align: center; display: flex; justify-content: center; }
          #barcode { height: 4.5mm !important; width: 55%; }
          .footer { position: absolute; top: 20.5mm; left: 3mm; width: 62mm; display: flex; font-size: 4.5pt; font-weight: bold; border-top: 0.3px solid black; padding-top: 0.2mm; }
          .footer-tec { width: 65%; text-align: left; }
          .footer-date { width: 35%; text-align: left; padding-left: 2mm; }
          .mantenimiento { position: absolute; bottom: 1.5mm; left: 3mm; width: 62mm; border: 0.4px solid black; text-align: center; font-size: 5pt; font-weight: bold; padding: 0.1mm 0; text-transform: uppercase; line-height: 0.8; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>CSTM</h2>
          <p>PREFECTURA DE PICHINCHA - SOPORTE TÉCNICO</p>
        </div>
        <div class="data-section">
          <div class="row"><span class="label">BIEN:</span><span class="val">${equipo.codigoBien}</span></div>
          <div class="row"><span class="label">TIPO:</span><span class="val">${equipo.tipo || 'ESCRITORIO'}</span></div>
          <div class="row"><span class="label">UBICACIÓN:</span><span class="val">${equipo.dependencia}</span></div>
        </div>
        <div class="barcode-container"><svg id="barcode"></svg></div>
        <div class="footer">
          <div class="footer-tec">TÉC: ${this.tecnicoLogeado.toUpperCase()}</div>
          <div class="footer-date">${fechaManual}</div>
        </div>
        <div class="mantenimiento">CONTROL MANTENIMIENTO</div>
        <script>
          JsBarcode("#barcode", "${equipo.codigoBien}", { format: "CODE128", width: 0.55, height: 8, displayValue: true, fontSize: 4.2, margin: 0 });
          setTimeout(() => { window.print(); window.close(); }, 500);
        </script>
      </body>
      </html>
      `);
      WindowPrt.document.close();
    }
  }
}
