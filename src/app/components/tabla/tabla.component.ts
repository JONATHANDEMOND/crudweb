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

  equipoSeleccionado: any = null;
  mostrarModalRegistro: boolean = false;
  modoEdicion: boolean = false; // NUEVA VARIABLE PARA CONTROLAR EDICIÓN

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
      this.autos = p;
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

  filtrarEquiposs2() { /* Tu código original */ }
  trackById(index: number, item: any) { return item._id || item.id; }
  contarUpsMalos() { return this.vehiculosFiltrados.filter(x => x.estadoups === 'Malo').length; }
  contarUsuarios() { const usuarios = new Set(this.vehiculosFiltrados.map(x => x.usuario)); return usuarios.size; }
  contarSSD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'SSD').length; }
  contarM2() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'M2').length; }
  contarHDD() { return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'HDD').length; }

  // ----------------------------------------------------
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
