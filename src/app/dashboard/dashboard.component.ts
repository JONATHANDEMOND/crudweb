import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- IMPORTACIÓN NECESARIA PARA ngModel
import { AutoServiceService } from '../service/auto-service.service';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- AGREGADO AQUÍ
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  servicio = inject(AutoServiceService);

  edificioCentral: any[] = [];
  sitiosRemotos: any[] = [];
  impresorasEC: any[] = [];
  impresorasSR: any[] = [];
  proyectoresEC: any[] = [];
proyectoresSR: any[] = [];
scannersEC: any[] = [];
scannersSR: any[] = [];

  // VARIABLE PARA EL FILTRO DE BAJAS
  filtroBajas = {
    tipo: 'todo',
    desde: '',
    hasta: ''
  };

  equiposTotales: any[] = [];
  impresorasTotales: any[] = [];

  totalPCs = 0;
  totalImpresoras = 0;
  upsMalosGlobal = 0;

  // NUEVAS VARIABLES DE MANTENIMIENTO
  mantenimientoSin = 0;
  mantenimientoVencido = 0;

  contadores = {
    EC: { pcs: 0, impresoras: 0, upsMalos: 0 },
    SR: { pcs: 0, impresoras: 0, upsMalos: 0 }
  };

  graficos: any = {};

  ngOnInit() {
    this.cargarDatos();
  }

cargarDatos() {
    // 1. Cargar Equipos e Impresoras de Edificio Central
    this.servicio.getEdificioCentral().subscribe(ec => {
      this.edificioCentral = ec;
      this.servicio.getImpresorasEC().subscribe(iec => {
        this.impresorasEC = iec;
        this.generarGraficosUbicacion('EC', this.edificioCentral, this.impresorasEC);
        this.actualizarTotales();
      });
    });

    // 2. Cargar Equipos (Autos) e Impresoras de Sitios Remotos
    this.servicio.getAutos().subscribe(sr => {
      this.sitiosRemotos = sr;
      this.servicio.getImpresorasSR().subscribe(isr => {
        this.impresorasSR = isr;
        this.generarGraficosUbicacion('SR', this.sitiosRemotos, this.impresorasSR);
        this.actualizarTotales();
      });
    });

    // 3. Cargar Proyectores y Scanners de ambas ubicaciones
    this.servicio.getProyectoresEC().subscribe(data => this.proyectoresEC = data);
    this.servicio.getProyectoresSR().subscribe(data => this.proyectoresSR = data);
    this.servicio.getScannersEC().subscribe(data => this.scannersEC = data);
    this.servicio.getScannersSR().subscribe(data => this.scannersSR = data);
  }

  actualizarTotales() {
    this.equiposTotales = [...this.edificioCentral, ...this.sitiosRemotos];
    this.impresorasTotales = [...this.impresorasEC, ...this.impresorasSR];
    const todosLosEquipos = [...this.equiposTotales, ...this.impresorasTotales];

    this.totalPCs = this.equiposTotales.length;
    this.totalImpresoras = this.impresorasTotales.length;
    this.upsMalosGlobal = this.equiposTotales.filter(e => e.estadoups === 'Malo' || e.estado_ups === 'Malo').length;

    this.contadores.EC = {
      pcs: this.edificioCentral.length,
      impresoras: this.impresorasEC.length,
      upsMalos: this.edificioCentral.filter(e => e.estadoups === 'Malo' || e.estado_ups === 'Malo').length
    };

    this.contadores.SR = {
      pcs: this.sitiosRemotos.length,
      impresoras: this.impresorasSR.length,
      upsMalos: this.sitiosRemotos.filter(e => e.estadoups === 'Malo' || e.estado_ups === 'Malo').length
    };

    // --- LÓGICA DE MANTENIMIENTO ---
    const haceUnAno = new Date();
    haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);

    this.mantenimientoSin = todosLosEquipos.filter(e => !e.fechaUltimoMantenimiento).length;

    this.mantenimientoVencido = todosLosEquipos.filter(e => {
      if (!e.fechaUltimoMantenimiento) return false;
      return new Date(e.fechaUltimoMantenimiento) < haceUnAno;
    }).length;

    // Generamos el gráfico comparativo global
    this.generarGraficoComparativo();
  }

  generarGraficoComparativo() {
    if (this.graficos['chartComparativo']) this.graficos['chartComparativo'].destroy();
    const canvas = document.getElementById('chartComparativo') as HTMLCanvasElement;
    if (canvas) {
      this.graficos['chartComparativo'] = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Total PCs', 'Total Impresoras', 'UPS Malos'],
          datasets: [
            {
              label: 'Edificio Central',
              data: [this.contadores.EC.pcs, this.contadores.EC.impresoras, this.contadores.EC.upsMalos],
              backgroundColor: '#0d6efd',
              borderRadius: 5
            },
            {
              label: 'Sitios Remotos',
              data: [this.contadores.SR.pcs, this.contadores.SR.impresoras, this.contadores.SR.upsMalos],
              backgroundColor: '#0dcaf0',
              borderRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }
  }

  generarGraficosUbicacion(ubicacion: string, pcs: any[], impresoras: any[]) {
    const ssd = pcs.filter(e => e.tipoDisco === 'SSD').length;
    const hdd = pcs.filter(e => e.tipoDisco === 'HDD').length;
    const m2 = pcs.filter(e => e.tipoDisco === 'M2' || e.tipoDisco === 'M.2').length;
    this.crearGrafico(`chartDiscos${ubicacion}`, 'doughnut', ['SSD', 'HDD', 'M.2'], [ssd, hdd, m2], ['#0d6efd', '#dc3545', '#ffc107']);

    const upsBuenos = pcs.filter(e => e.estadoups === 'Bueno' || e.estado_ups === 'Bueno').length;
    const upsRegulares = pcs.filter(e => e.estadoups === 'Regular' || e.estado_ups === 'Regular').length;
    const upsMalos = pcs.filter(e => e.estadoups === 'Malo' || e.estado_ups === 'Malo').length;
    this.crearGrafico(`chartUps${ubicacion}`, 'pie', ['Bueno', 'Regular', 'Malo'], [upsBuenos, upsRegulares, upsMalos], ['#198754', '#ffc107', '#dc3545']);

    const conteoMarcas: any = {};
    impresoras.forEach(i => {
      const marca = i.marcaModelo || i.tipo || i.modelo || 'Desconocida';
      conteoMarcas[marca] = (conteoMarcas[marca] || 0) + 1;
    });
    this.crearGrafico(`chartImp${ubicacion}`, 'pie', Object.keys(conteoMarcas), Object.values(conteoMarcas) as number[], ['#0d6efd', '#6f42c1', '#fd7e14', '#e83e8c', '#20c997']);
  }

  crearGrafico(idCanvas: string, tipo: any, labels: string[], data: number[], colores: string[]) {
    if (this.graficos[idCanvas]) this.graficos[idCanvas].destroy();
    const canvas = document.getElementById(idCanvas) as HTMLCanvasElement;
    if (canvas) {
      this.graficos[idCanvas] = new Chart(canvas, {
        type: tipo,
        data: { labels, datasets: [{ data, backgroundColor: colores }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } } }
      });
    }
  }

 // 3. Reemplaza tu método generarReporteDetallado actual por este:
generarReporteDetallado(tipo: string) {
  const doc = new jsPDF('landscape');
  doc.setFontSize(16); doc.setTextColor(40);
  doc.text('Dirección de Tecnologías de la Información', 14, 15);
  doc.setFontSize(12); doc.text(`Coordinación de Soporte Técnico y Mantenimiento (CSTM)`, 14, 22);
  doc.setFontSize(14); doc.setTextColor(0, 51, 153); doc.text(`Informe de Mantenimiento y Equipos - ${tipo}`, 14, 32);
  doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generado el: ${new Date().toLocaleDateString('es-EC')}`, 14, 38);

  let fuenteDatos: any[] = [];

  // Asignación de datos según el tipo
  if (tipo === 'Edificio Central') fuenteDatos = this.edificioCentral;
  if (tipo === 'Sitios Remotos') fuenteDatos = this.sitiosRemotos;
  if (tipo === 'Impresoras Edificio Central') fuenteDatos = this.impresorasEC;
  if (tipo === 'Impresoras Sitios Remotos') fuenteDatos = this.impresorasSR;
  if (tipo === 'Proyectores Edificio Central') fuenteDatos = this.proyectoresEC;
  if (tipo === 'Proyectores Sitios Remotos') fuenteDatos = this.proyectoresSR;
  if (tipo === 'Scanners Edificio Central') fuenteDatos = this.scannersEC;
  if (tipo === 'Scanners Sitios Remotos') fuenteDatos = this.scannersSR;

  if (!fuenteDatos || fuenteDatos.length === 0) {
    alert(`No hay datos registrados en la categoría "${tipo}".`);
    return;
  }
  // Identificadores lógicos
  const esImpresora = tipo.includes('Impresoras');
  const esProyector = tipo.includes('Proyectores');
  const esScanner = tipo.includes('Scanners');
  // Ajuste dinámico del nombre de la última columna
  let nombreUltimaColumna = 'Estado UPS';
  if (esImpresora) nombreUltimaColumna = 'Dirección IP';
  if (esProyector || esScanner) nombreUltimaColumna = 'Estado/Condición'; // Puedes cambiar esto al campo extra que uses en tu BD

  let columnas = ['Código Bien', 'Tipo/Modelo', 'Dependencia', 'Usuario', 'Último Mantenimiento', nombreUltimaColumna];

  let datosTabla = fuenteDatos.map(item => {
    let fechaMantenimiento = 'Sin Mantenimiento';
    if (item.fechaUltimoMantenimiento) fechaMantenimiento = new Date(item.fechaUltimoMantenimiento).toLocaleDateString('es-EC');

    const codigo = item.codigoBien || item.codigoAB || item.numeroSerie || 'N/A';
    const tipoModelo = item.tipo || item.marcaModelo || item.modelo || 'N/A';
    const ubicacion = item.dependencia || item.oficina || 'N/A';
    const responsable = item.usuario || item.custodio || 'N/A';
    // Ajuste dinámico del valor de la última columna
    let ultimaColumna = 'N/A';
    if (esImpresora) {
      ultimaColumna = item.ip || item.direccionIP || 'Sin IP asignada';
    } else if (esProyector || esScanner) {
      ultimaColumna = item.estado || item.condicion || 'N/A'; // Ajustar según los campos de tu base de datos
    } else {
      ultimaColumna = item.estadoups || item.estado_ups || 'N/A';
    }

    return [codigo, tipoModelo, ubicacion, responsable, fechaMantenimiento, ultimaColumna];
  });

  autoTable(doc, {
    startY: 42,
    head: [columnas],
    body: datosTabla,
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 153] },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });

  doc.save(`Informe_${tipo.replace(/\s+/g, '_')}_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`);
}

  generarInformeBajas() {
    if (this.filtroBajas.tipo === 'rango') {
      if (!this.filtroBajas.desde || !this.filtroBajas.hasta) {
        alert("Por favor, selecciona la fecha de inicio (Desde) y de fin (Hasta).");
        return;
      }
      if (this.filtroBajas.desde > this.filtroBajas.hasta) {
        alert("La fecha 'Desde' no puede ser mayor que 'Hasta'.");
        return;
      }
    }

    this.servicio.getTodasLasBajas().subscribe({
      next: (bajasObtenidas: any[]) => {
        let datosFiltrados = bajasObtenidas;

        if (this.filtroBajas.tipo === 'rango') {
          const fechaDesde = new Date(this.filtroBajas.desde + 'T00:00:00');
          const fechaHasta = new Date(this.filtroBajas.hasta + 'T23:59:59');

          datosFiltrados = bajasObtenidas.filter(b => {
            const fechaBaja = new Date(b.fecha);
            return fechaBaja >= fechaDesde && fechaBaja <= fechaHasta;
          });
        }

        if (datosFiltrados.length === 0) {
          alert("No se encontraron bajas registradas en este período.");
          return;
        }

        const doc = new jsPDF('landscape');
        doc.setFontSize(16); doc.setTextColor(40);
        doc.text('Dirección de Tecnologías de la Información', 14, 15);
        doc.setFontSize(12); doc.text(`Coordinación de Soporte Técnico y Mantenimiento (CSTM)`, 14, 22);
        doc.setFontSize(14); doc.setTextColor(220, 53, 69);

        let subtitulo = this.filtroBajas.tipo === 'todo'
          ? 'Informe General de Equipos dados de Baja (Histórico)'
          : `Informe de Equipos dados de Baja (Desde ${this.filtroBajas.desde} al ${this.filtroBajas.hasta})`;
        doc.text(subtitulo, 14, 32);

        doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generado el: ${new Date().toLocaleDateString('es-EC')}`, 14, 38);

        let columnas = ['Fecha Baja', 'Código Bien', 'Componente', 'Motivo', 'Informe Técnico', 'Observación'];

        let datosTabla = datosFiltrados.map(item => {
          let fechaFormat = item.fecha ? new Date(item.fecha).toLocaleDateString('es-EC') : 'N/A';
          return [
            fechaFormat,
            item.codigoBien || item.codigoAB || 'N/A',
            item.componente || 'N/A',
            item.motivo || 'N/A',
            item.informe || 'N/A',
            item.observacion || 'N/A'
          ];
        });

        autoTable(doc, {
          startY: 42,
          head: [columnas],
          body: datosTabla,
          theme: 'striped',
          headStyles: { fillColor: [220, 53, 69] },
          styles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`Informe_Bajas_${new Date().getTime()}.pdf`);
      },
      error: (err) => {
        console.error("Error al obtener las bajas", err);
        alert("Ocurrió un error al obtener el registro de bajas desde el servidor.");
      }
    });
  }
}
