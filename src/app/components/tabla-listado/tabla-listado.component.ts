import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../../service/auto-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-listado',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './tabla-listado.component.html',
  styleUrl: './tabla-listado.component.css' // Corregido: styleUrl -> styleUrls en Angular antiguo, pero si usas Angular 17+ es styleUrl (sin s)
})
// CORRECCIÓN 1: El nombre de la clase debe coincidir con el archivo.
// Antes decía "class TablaComponent", lo cambié a "class TablaListadoComponent" para evitar conflicto con tu otra tabla.
export class TablaListadoComponent implements OnInit {
  servicio = inject(AutoServiceService);
  edificioCentral: any[] = [];

  // CORRECCIÓN 2: Eliminé "autos: any[] = []" porque aquí solo manejaremos el Edificio Central.
  vehiculosFiltrados: any[] = [];
  equipoSeleccionado: any = null;

  fechaActual = new Date();
  tecnicoLogeado: string = '';

  busquedaCodigo: string = '';
  busquedaUsuario: string = '';

  ngOnInit() {
    this.servicio.getEdificioCentral().subscribe(p => {
      this.edificioCentral = p;
      this.vehiculosFiltrados = [...this.edificioCentral];
    });

    this.cargarTecnico();
  }

  cargarTecnico() {
    const log = localStorage.getItem('login');
    if (log) {
      try {
        const usuarioObj = JSON.parse(log);
        this.tecnicoLogeado = usuarioObj.nombre || usuarioObj.usuario || 'Técnico CSTM';
      } catch (e) {
        console.error("Error al parsear el usuario", e);
        this.tecnicoLogeado = 'Técnico CSTM';
      }
    } else {
      this.tecnicoLogeado = 'Técnico CSTM';
    }
  }

  abrirDetalles(item: any) {
    this.equipoSeleccionado = item;
  }

  // CORRECCIÓN 3: Ajusté el método eliminar.
  // Ahora debe llamar a un método deleteEdificioCentral() (que debes crear en tu servicio).
  // Y ahora filtra 'edificioCentral', no 'autos'.
  eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este registro del Edificio Central?')) {
      // OJO: Asegúrate de tener deleteEdificioCentral(id) en tu auto-service.service.ts
      this.servicio.deleteEdificioCentral(id).subscribe(() => {
        this.edificioCentral = this.edificioCentral.filter(item => item.id !== id);
        this.filtrarEquipos();
      });
    }
  }

  filtrarEquipos() {
    this.vehiculosFiltrados = this.edificioCentral.filter(item => {
      const nombreUsuario = item.usuario ? String(item.usuario).toLowerCase() : '';
      const filtroUsuario = this.busquedaUsuario.toLowerCase();
      const cumpleUsuario = nombreUsuario.includes(filtroUsuario);

      const filtroCodigo = this.busquedaCodigo.toString().toLowerCase();
      const cumpleCodigo = !this.busquedaCodigo ||
                           item.codigoBien?.toString().toLowerCase().includes(filtroCodigo) ||
                           item.codigoBienMonitor?.toString().toLowerCase().includes(filtroCodigo) ||
                           item.codigoBienMouse?.toString().toLowerCase().includes(filtroCodigo) ||
                           item.codigoBienTeclado?.toString().toLowerCase().includes(filtroCodigo);

      return cumpleUsuario && cumpleCodigo;
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  contarUpsMalos() {
    return this.vehiculosFiltrados.filter(x => x.estadoups === 'Malo').length;
  }

  contarUsuarios() {
    const usuarios = new Set(this.vehiculosFiltrados.map(x => x.usuario));
    return usuarios.size;
  }

  contarSSD() {
    return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'SSD').length;
  }

  contarM2() {
    return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'M2').length;
  }

  contarHDD() {
    return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'HDD').length;
  }

  // Se mantiene intacta tu etiqueta ajustada a 5mm a la derecha
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
            width: 78mm;
            height: 38mm;
            margin: 0;
            padding: 0;
            font-family: 'Arial Narrow', Arial, sans-serif;
            position: relative;
            overflow: hidden;
            background: white;
          }
          .header {
            position: absolute;
            top: 0.5mm;
            left: -5mm;
            width: 100%;
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 8.5pt; font-weight: bold; line-height: 0.7; }
          .header p {
            margin: 0.2mm 0 0 0;
            font-size: 3.5pt;
            font-weight: bold;
            border-bottom: 0.3px solid black;
            display: inline-block;
            width: 65%;
            padding-bottom: 0.1mm;
            line-height: 0.7;
          }
          .data-section {
            position: absolute;
            top: 4.5mm;
            left: 3mm;
            width: 62mm;
          }
          .row {
            display: flex;
            font-size: 5.2pt;
            line-height: 0.85;
            margin-bottom: 0.2mm;
          }
          .label { font-weight: bold; width: 11mm; color: #000; }
          .val { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: normal; }
          .barcode-container {
            position: absolute;
            top: 10.5mm;
            left: -5mm;
            width: 100%;
            text-align: center;
            display: flex;
            justify-content: center;
          }
          #barcode {
            height: 4.5mm !important;
            width: 55%;
          }
          .footer {
            position: absolute;
            top: 20.5mm;
            left: 3mm;
            width: 62mm;
            display: flex;
            font-size: 4.5pt;
            font-weight: bold;
            border-top: 0.3px solid black;
            padding-top: 0.2mm;
          }
          .footer-tec { width: 65%; text-align: left; }
          .footer-date { width: 35%; text-align: left; padding-left: 2mm; }
          .mantenimiento {
            position: absolute;
            bottom: 1.5mm;
            left: 3mm;
            width: 62mm;
            border: 0.4px solid black;
            text-align: center;
            font-size: 5pt;
            font-weight: bold;
            padding: 0.1mm 0;
            text-transform: uppercase;
            line-height: 0.8;
          }
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
        <div class="barcode-container">
          <svg id="barcode"></svg>
        </div>
        <div class="footer">
          <div class="footer-tec">TÉC: ${this.tecnicoLogeado.toUpperCase()}</div>
          <div class="footer-date">${fechaManual}</div>
        </div>
        <div class="mantenimiento">CONTROL MANTENIMIENTO</div>
        <script>
          JsBarcode("#barcode", "${equipo.codigoBien}", {
            format: "CODE128",
            width: 0.55,
            height: 8,
            displayValue: true,
            fontSize: 4.2,
            margin: 0
          });
          setTimeout(() => {
            window.print();
            window.close();
          }, 500);
        </script>
      </body>
      </html>
      `);
      WindowPrt.document.close();
    }
  }
}
