import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../../service/auto-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css'
})
export class TablaComponent implements OnInit {
  servicio = inject(AutoServiceService);


  autos: any[] = [];
  vehiculosFiltrados: any[] = [];
  busquedaGlobal: string = ''; // Nueva variable para el buscador universal
  // Variables para el Modal de Baja
  equipoSeleccionados: any = null;
  datosBaja = {
    componente: 'Completo',
    motivo: '',
    informe: '',
    observacion: '',
    nuevoCodigo: '', // <--- NUEVO
      nuevaSerie: '',   // <--- NUEVO
    fecha: new Date().toISOString().substring(0, 10) // Fecha de hoy por defecto
  };
  equipoSeleccionado: any = null;
  mostrarModalRegistro: boolean = false;
  modoEdicion: boolean = false; // NUEVA VARIABLE PARA CONTROLAR EDICIÓN
  archivoBaja: File | null = null;
  fechaActual = new Date();
  tecnicoLogeado: string = '';

  busquedaCodigo: string = '';
  busquedaUsuario: string = '';

  // Aquí está la variable 'id' que usaremos
  id: any = ''; usuario: any = ''; dependencia: any = ''; hostname: any = '';
  tipo: any = ''; modelo: any = ''; codigoBien: any = ''; numeroSerie: any = '';
  codigoBienMonitor: any = ''; numeroSerieMonitor: any = ''; codigoBienMouse: any = '';
  numeroSerieMouse: any = ''; codigoBienTeclado: any = ''; numeroSerieTeclado: any = '';
  codigoBienUps: any = ''; numeroSerieUps: any = ''; estadoups: any = ''; tipoDisco: any = '';

  ngOnInit() {
    this.cargarDatos();
    this.cargarTecnico();
  }

 cargarDatos() {
    this.servicio.getAutos().subscribe(p => {
      // 1. Guardamos en this.autos SOLO los equipos que NO estén de baja
      this.autos = p.filter((equipo: any) => equipo.estadoFisico !== 'De Baja');

      // 2. Actualizamos la lista filtrada que se muestra en la tabla
      this.vehiculosFiltrados = [...this.autos];
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


  // BUSQUEDA GLOBAL: Filtra por cualquier campo relevante //
  filtrarEquipos() {
    if (!this.busquedaGlobal.trim()) {
      this.vehiculosFiltrados = [...this.autos];
      return;
    }

    const term = this.busquedaGlobal.toLowerCase();

    this.vehiculosFiltrados = this.autos.filter(item => {
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
    // Aquí capturamos el _id de MongoDB y lo guardamos en nuestra variable 'id'
    this.id = item._id;
    this.usuario = item.usuario;
    this.dependencia = item.dependencia;
    this.hostname = item.hostname;
    this.tipo = item.tipo;
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
      this.servicio.updateAuto(this.id, datos).subscribe({
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
      const idsExistentes = this.autos.map(a => Number(a.id) || 0);
      const maxId = idsExistentes.length > 0 ? Math.max(...idsExistentes) : 0;

      datos.id = (maxId + 1).toString();

      this.servicio.postAuto(datos).subscribe({
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
  }

  // --- RESTO DE FUNCIONES (ELIMINAR, FILTRAR, ETIQUETA) ---
  eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.servicio.deleteAuto(id).subscribe(() => {
        // Asegúrate de que al filtrar, se compare el identificador correcto (_id o id)
        this.autos = this.autos.filter(aut => (aut._id || aut.id) !== id);
        this.filtrarEquipos();
      });
    }
  }
  // Abre el modal y guarda temporalmente el equipo elegido
  abrirModalBaja(equipo: any) {
    this.equipoSeleccionados = equipo;
    this.archivoBaja = null; // Limpiar archivo previo
    // Reseteamos el formulario por si se abrió antes
    this.datosBaja = {
      componente: 'Completo',
      motivo: '',
      informe: '',
      observacion: '',
      nuevoCodigo: '', // <--- NUEVO
      nuevaSerie: '',  // <--- NUEVO
      fecha: new Date().toISOString().substring(0, 10)
    };
  }
  ///////////////esta función para capturar el archivo cuando el usuario lo seleccione
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoBaja = file;
      console.log('Archivo adjunto seleccionado:', file.name);
    }
  }

// Envía los datos al Backend (Formato JSON compatible)
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

    // Enviamos el objeto JSON limpio que la API de Node.js procesa sin problemas
    this.servicio.updateAuto(this.equipoSeleccionados._id, actualizacionBaja).subscribe({
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
        if (this.datosBaja.componente === 'Completo') {
          this.autos = this.autos.filter((e: any) => e._id !== this.equipoSeleccionados._id);
        } else {
          const index = this.autos.findIndex((e: any) => e._id === this.equipoSeleccionados._id);
          if (index !== -1) {
            if (this.datosBaja.componente === 'Monitor') {
              this.autos[index].codigoBienMonitor = nuevoCod;
              this.autos[index].numeroSerieMonitor = nuevaSer;
            } else if (this.datosBaja.componente === 'Teclado') {
              this.autos[index].codigoBienTeclado = nuevoCod;
              this.autos[index].numeroSerieTeclado = nuevaSer;
            } else if (this.datosBaja.componente === 'Mouse') {
              this.autos[index].codigoBienMouse = nuevoCod;
              this.autos[index].numeroSerieMouse = nuevaSer;
            } else if (this.datosBaja.componente === 'UPS') {
              this.autos[index].codigoBienUps = nuevoCod;
              this.autos[index].numeroSerieUps = nuevaSer;
              this.autos[index].estadoups = 'Bueno';
            }
          }
        }

        // 3. Forzamos a Angular a redibujar la tabla
        this.vehiculosFiltrados = [];
        setTimeout(() => {
          this.vehiculosFiltrados = [...this.autos];
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
  trackById(index: number, item: any) { return item._id || item.id; }
  contarUpsMalos() { return this.vehiculosFiltrados.filter(x => x.estadoups === 'Malo').length; }
  contarUsuarios() { const usuarios = new Set(this.vehiculosFiltrados.map(x => x.usuario)); return usuarios.size; }
  contarSSD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'SSD').length; }
  contarM2() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'M2').length; }
  contarHDD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'HDD').length; }

  // ----------------------------------------------------

  ///MARCAR EQUIPOS MANTENIMIENTO
marcarMantenimiento(equipo: any) {
  // 0. VALIDACIÓN CRÍTICA: Si el equipo no tiene ID, detenemos el proceso
  if (!equipo._id) {
    alert('Este equipo es nuevo y aún no se ha sincronizado su ID. Por favor, recarga la página e intenta de nuevo.');
    // Revertimos el switch para que no se quede marcado por error
    setTimeout(() => equipo.mantenimientoRealizado = !equipo.mantenimientoRealizado, 100);
    return;
  }

  // 1. Bloqueo para evitar spam de clics
  equipo.guardandoMantenimiento = true;
  console.log("Enviando a:", `http://192.168.0.11:4000/api/autos/${equipo._id}`);

  // 2. Preparación del historial
  if (!equipo.historialMantenimientos) {
    equipo.historialMantenimientos = [];
  }

  const estadoSwitchAnterior = !equipo.mantenimientoRealizado;
  const historialAnterior = [...equipo.historialMantenimientos];
  const fechaPlanaAnterior = equipo.fechaUltimoMantenimiento;

  // 3. Lógica de actualización local
  if (equipo.mantenimientoRealizado) {
    const nuevaFecha = new Date().toISOString();
    equipo.historialMantenimientos.push({ fecha: nuevaFecha });
    equipo.fechaUltimoMantenimiento = nuevaFecha;
  } else {
    equipo.fechaUltimoMantenimiento = null;
  }

  // 4. Llamada al servicio
  this.servicio.actualizarEquipo(equipo._id, equipo).subscribe({
    next: (res: any) => {
      console.log('Respuesta del servidor:', res);
      equipo.guardandoMantenimiento = false;
    },
    error: (err: any) => {
      console.error('ERROR DETALLADO:', err);
      // 5. REVERSIÓN TOTAL
      equipo.mantenimientoRealizado = estadoSwitchAnterior;
      equipo.historialMantenimientos = historialAnterior;
      equipo.fechaUltimoMantenimiento = fechaPlanaAnterior;
      equipo.guardandoMantenimiento = false;
      alert('Error de conexión al guardar el mantenimiento. Revisa la consola (F12).');
    }
  });
}
  // LIMPIAR MANTENIMIENTO
limpiarMantenimiento(equipo: any) {
  // Validación de seguridad
  if (!equipo._id) {
    alert('Error: El equipo no tiene un ID válido. Recarga la página.');
    return;
  }

  if (confirm('¿Está seguro de que desea eliminar todo el historial y estado de mantenimiento de este equipo?')) {

    // BLOQUEAMOS LA INTERFAZ MIENTRAS SE LIMPIA
    equipo.guardandoMantenimiento = true;

    // 1. Limpiamos los campos
    equipo.mantenimientoRealizado = false;
    equipo.fechaUltimoMantenimiento = null;
    equipo.historialMantenimientos = [];

    // 2. Enviamos la actualización al servidor
    this.servicio.actualizarEquipo(equipo._id, equipo).subscribe({
      next: (res: any) => {
        console.log('Mantenimiento limpiado exitosamente');
        // DESBLOQUEAMOS LA INTERFAZ AL TERMINAR
        equipo.guardandoMantenimiento = false;
      },
      error: (err: any) => {
        console.error('Error al limpiar el mantenimiento', err);
        // DESBLOQUEAMOS LA INTERFAZ SI FALLA
        equipo.guardandoMantenimiento = false;
        alert('No se pudo limpiar el mantenimiento. Intente de nuevo.');
      }
    });
  }
}

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
      /* Se agregó 'landscape' para forzar la impresión horizontal */
      @page { size: 78mm 38mm landscape; margin: 0; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
      body {
        width: 78mm; height: 38mm; margin: 0; padding: 0;
        font-family: 'Arial Narrow', Arial, sans-serif;
        position: relative; overflow: hidden; background: white;
      }

      /* 1. HEADER: Centrado correctamente a lo ancho de toda la etiqueta */
      .header { position: absolute; top: 1mm; left: 0; width: 100%; text-align: center; }
      .header h1 { margin: 0; font-size: 6.5pt; font-weight: bold; line-height: 0.9; }
      .header p { margin: 0.2mm 0 0 0; font-size: 3.5pt; font-weight: bold; border-bottom: 0.3px solid black; display: inline-block; width: 62mm; padding-bottom: 0.1mm; line-height: 0.7; }

      /* 2. DATOS: Se bajaron un poquito para no chocar con el título y se centraron a 8mm */
      .data-section { position: absolute; top: 5.5mm; left: 12mm; width: 62mm; }
      .row { display: flex; font-size: 5.2pt; line-height: 0.85; margin-bottom: 0.4mm; }
      .label { font-weight: bold; width: 13mm; color: #000; }
      .val { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: normal; }

      /* 3. CÓDIGO DE BARRAS: Se bajó a 14mm para que no se superponga con UBICACIÓN */
      .barcode-container { position: absolute; top: 14mm; left: 0; width: 100%; text-align: center; display: flex; justify-content: center; }
      #barcode { height: 5mm !important; width: 55%; }

      /* 4. FOOTER: Se ajustó el margen izquierdo (sin el espacio de error) y se bajó para dar espacio al código */
      .footer { position: absolute; top: 23mm; left: 8mm; width: 62mm; display: flex; font-size: 4.5pt; font-weight: bold; border-top: 0.3px solid black; padding-top: 0.3mm; }
      .footer-tec { width: 75%; text-align: left; padding-left: 5mm;}
      .footer-date { width: 45%; text-align: center; }

      /* 5. MANTENIMIENTO: Se corrigió "1.5 mm" por "1.5mm" y se subió ligeramente a 2.5mm */
      .mantenimiento { position: absolute; bottom: 2.5mm; left: 8mm; width: 62mm; border: 0.4px solid black; text-align: center; font-size: 5pt; font-weight: bold; padding: 0.1mm 0; text-transform: uppercase; line-height: 0.8; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>CSTM</h1>
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
    <div class="mantenimiento">CONTROL MANTENIMIENTO-CSTM</div>
    <script>
      JsBarcode("#barcode", "${equipo.codigoBien}", { format: "CODE128", width: 0.55, height: 8, displayValue: true, fontSize: 10.2, margin: 0 });
      setTimeout(() => { window.print(); window.close(); }, 500);
    </script>
  </body>
</html>
      `);
      WindowPrt.document.close();
    }
  }
}
