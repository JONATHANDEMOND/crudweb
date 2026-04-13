import { Component, inject, OnInit } from '@angular/core';
import {  RouterModule } from '@angular/router';
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
  equipoSeleccionado: any;
  fechaActual = new Date();
  tecnicoLogeado: string = '';

  busquedaCodigo: string = '';
  busquedaUsuario: string = '';

  ngOnInit() {
    // 1. Cargar datos de la base de datos
    this.servicio.getAutos().subscribe(p => {
      this.autos = p;
      this.vehiculosFiltrados = [...this.autos];
    });

    // 2. Obtener el técnico desde el localStorage (Login)
    const log = localStorage.getItem('login');
    if (log) {
      const usuarioObj = JSON.parse(log);
      // Asignamos el nombre completo del técnico logueado
      this.tecnicoLogeado = usuarioObj.nombre || 'Técnico CSTM';
    }
  }

  eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.servicio.deleteAuto(id).subscribe(() => {
        this.autos = this.autos.filter(aut => aut.id !== id);
        this.filtrarEquipos();
      });
    }
  }

  filtrarEquipos() {
    this.vehiculosFiltrados = this.autos.filter(item => {
      // Filtro por Usuario
      const nombreUsuario = item.usuario ? String(item.usuario).toLowerCase() : '';
      const filtroUsuario = this.busquedaUsuario.toLowerCase();
      const cumpleUsuario = nombreUsuario.includes(filtroUsuario);

      // Filtro por Código de Bien (CPU, Monitor o Periféricos)
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
imprimirEtiqueta(equipo: any) {

  const WindowPrt = window.open('', '', 'width=400,height=300');

  if (WindowPrt) {

    WindowPrt.document.write(`
    <html>
    <head>

    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

    <style>

    @page{
      size:77mm 37mm;
      margin:0;
    }

    body{
      width:77mm;
      height:37mm;
      margin:0;
      padding:1mm 2mm;
      font-family:Arial;
      box-sizing:border-box;
      overflow:hidden;
    }

    .header{
      text-align:center;
      border-bottom:1px solid black;
      margin-bottom:0.5mm;
    }

    .header h1{
      margin:0;
      font-size:11pt;
      font-weight:bold;
    }

    .header p{
      margin:0;
      font-size:5pt;
      font-weight:bold;
    }

    .row{
      display:flex;
      font-size:6.5pt;
      margin-bottom:0.3mm;
    }

    .label{
      width:20mm;
      font-weight:bold;
    }

    .val{
      flex:1;
      overflow:hidden;
      white-space:nowrap;
    }

    .barcode{
      text-align:center;
      margin-top:0.5mm;
    }

    .barcode svg{
      width:100%;
      height:10mm;
    }

    .footer{
      display:flex;
      justify-content:space-between;
      font-size:5.5pt;
      margin-top:0.3mm;
    }

    .mantenimiento{
      text-align:center;
      border:1px solid black;
      font-size:6pt;
      font-weight:bold;
      margin-top:0.3mm;
    }

    </style>

    </head>

    <body>

    <div class="header">
      <h1>CSTM</h1>
      <p>PREFECTURA DE PICHINCHA - SOPORTE TÉCNICO</p>
    </div>

    <div class="row">
      <span class="label">BIEN:</span>
      <span class="val">${equipo.codigoBien}</span>
    </div>

    <div class="row">
      <span class="label">TIPO:</span>
      <span class="val">${equipo.tipoEquipo || 'DESKTOP'}</span>
    </div>

    <div class="row">
      <span class="label">MODELO:</span>
      <span class="val">${equipo.modelo}</span>
    </div>

    <div class="row">
      <span class="label">UBICACIÓN:</span>
      <span class="val">${equipo.dependencia}</span>
    </div>

    <div class="barcode">
      <svg id="barcode"></svg>
    </div>

    <div class="footer">
      <span>TÉC: ${this.tecnicoLogeado}</span>
      <span>${new Date().toLocaleDateString('es-EC')}</span>
    </div>

    <div class="mantenimiento">
      CONTROL MANTENIMIENTO
    </div>

    <script>
      JsBarcode("#barcode","${equipo.codigoBien}",{
        format:"CODE128",
        width:1.4,
        height:25,
        displayValue:true,
        fontSize:7,
        margin:0
      });

      window.print();
      window.close();
    </script>

    </body>
    </html>
    `);

    WindowPrt.document.close();
  }
}
contarUpsMalos() {
  return this.vehiculosFiltrados.filter(x => x.estadoups === 'Malo').length;
}

contarDiscosMalos() {
  return this.vehiculosFiltrados.filter(x => x.tipoDisco === 'HDD MALO').length;
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
}
