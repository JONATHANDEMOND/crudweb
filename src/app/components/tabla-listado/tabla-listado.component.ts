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

  fechaActual = new Date();
  tecnicoLogeado: string = '';

  busquedaCodigo: string = '';
  busquedaUsuario: string = '';

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
    this.servicio.getEdificioCentral().subscribe(p => {
      this.edificioCentral= p;
      this.vehiculosFiltrados = [...this.edificioCentral];
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
    this.id = item.id;
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

  if (this.modoEdicion) {
    // Si estamos editando, mandamos el ID que ya tiene
    this.servicio.updateEdificioCentral(this.id, datos).subscribe(() => {
      alert("✅ Equipo actualizado");
      this.cerrarModalRegistro();
      this.cargarDatos();
    });
  } else {
    // SI ESTAMOS CREANDO: Calculamos el nuevo ID
    // Convertimos los IDs existentes a números y buscamos el máximo
    const idsExistentes = this.edificioCentral.map(a => Number(a.id) || 0);
    const maxId = idsExistentes.length > 0 ? Math.max(...idsExistentes) : 0;

    // Asignamos el nuevo ID (el máximo + 1)
    datos.id = (maxId + 1).toString();

    this.servicio.postEdificioCentral(datos).subscribe(() => {
      alert("✅ Equipo registrado con ID: " + datos.id);
      this.cerrarModalRegistro();
      this.cargarDatos();
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
      this.servicio.deleteEdificioCentral(id).subscribe(() => {
        this.edificioCentral = this.edificioCentral.filter(aut => aut.id !== id);
        this.filtrarEquipos();
      });
    }
  }

  filtrarEquiposs2() { /* Tu código original */ }
  trackById(index: number, item: any) { return item.id; }
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
