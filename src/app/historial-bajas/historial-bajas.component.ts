import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../service/auto-service.service';

@Component({
  selector: 'app-historial-bajas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-bajas.component.html',
  styleUrls: ['./historial-bajas.component.css']
})
export class HistorialBajasComponent implements OnInit {
  bajasTotales: any[] = [];
  bajasFiltradas: any[] = [];
  busquedaGlobal: string = '';

  itemSeleccionado: any = null;

  constructor(private autoService: AutoServiceService) {}

  ngOnInit() {
    this.cargarTodasLasBajas();
  }

  cargarTodasLasBajas() {
    this.bajasTotales = [];

    // 1. Cargar Equipos (Sitios Remotos)
    this.autoService.getAutos().subscribe(data => {
      const bajasSR = this.procesarBajasEquipos(data, 'Sitios Remotos');
      this.bajasTotales = [...this.bajasTotales, ...bajasSR];
      this.filtrarBajas();
    });

    // 2. Cargar Equipos (Edificio Central)
    this.autoService.getEdificioCentral().subscribe(data => {
      const bajasEC = this.procesarBajasEquipos(data, 'Edificio Central');
      this.bajasTotales = [...this.bajasTotales, ...bajasEC];
      this.filtrarBajas();
    });

    // 3. Cargar Impresoras (Sitios Remotos)
    this.autoService.getImpresorasSR().subscribe(data => {
      const impSR = this.procesarBajasImpresoras(data, 'Sitios Remotos');
      this.bajasTotales = [...this.bajasTotales, ...impSR];
      this.filtrarBajas();
    });

    // 4. Cargar Impresoras (Edificio Central)
    this.autoService.getImpresorasEC().subscribe(data => {
      const impEC = this.procesarBajasImpresoras(data, 'Edificio Central');
      this.bajasTotales = [...this.bajasTotales, ...impEC];
      this.filtrarBajas();
    });
  }

  // --- LÓGICA PARA EXTRAER BAJAS COMPLETAS Y PARCIALES (PERIFÉRICOS) ---
  procesarBajasEquipos(data: any[], origen: string): any[] {
    let extraidos: any[] = [];

    data.forEach(item => {
      // Si todo el equipo se dio de baja
      if (item.estadoFisico === 'De Baja' && item.datosBajaTecnica) {
        extraidos.push(this.formatearBaja(item, 'Equipo PC', origen, 'PC Completa', item.datosBajaTecnica));
      }

      // Bajas de periféricos individuales (incluso si el equipo sigue activo)
      if (item.historialBajaMonitor) {
        extraidos.push(this.formatearBaja(item, 'Periférico', origen, 'Monitor', item.historialBajaMonitor));
      }
      if (item.historialBajaTeclado) {
        extraidos.push(this.formatearBaja(item, 'Periférico', origen, 'Teclado', item.historialBajaTeclado));
      }
      if (item.historialBajaMouse) {
        extraidos.push(this.formatearBaja(item, 'Periférico', origen, 'Mouse', item.historialBajaMouse));
      }
      if (item.historialBajaUPS || item.historialBajaUps) { // Por si cambia la mayúscula
        const upsData = item.historialBajaUPS || item.historialBajaUps;
        extraidos.push(this.formatearBaja(item, 'Periférico', origen, 'UPS', upsData));
      }
    });

    return extraidos;
  }

  // --- LÓGICA PARA EXTRAER BAJAS DE IMPRESORAS ---
  procesarBajasImpresoras(data: any[], origen: string): any[] {
    return data
      .filter(item => item.estadoFisico === 'De Baja' && item.datosBajaTecnica)
      .map(item => this.formatearBaja(item, 'Impresora', origen, 'Impresora Completa', item.datosBajaTecnica));
  }

  // --- NORMALIZADOR DE OBJETOS PARA LA TABLA UNIFICADA ---
  // --- NORMALIZADOR DE OBJETOS PARA LA TABLA UNIFICADA ---
  formatearBaja(itemOriginal: any, categoria: string, origen: string, componente: string, datosBaja: any) {
    return {
      ...itemOriginal,
      tipoCategoria: categoria,
      origenBD: origen,
      componenteBaja: componente,
      motivoBaja: datosBaja.motivo,
      informeBaja: datosBaja.informe,
      fechaBaja: datosBaja.fecha,
      observacionBaja: datosBaja.observacion,
      // Agregamos el campo del documento (Ajusta 'archivoUrl' o 'documento' según cómo lo guarde tu backend)
      documentoBaja: datosBaja.archivoUrl || datosBaja.documento || datosBaja.archivo || null
    };
  }
  // --- FUNCIÓN PARA VISUALIZAR EL DOCUMENTO ---
// --- FUNCIÓN PARA VISUALIZAR EL DOCUMENTO (BASE64 A BLOB) ---
// --- FUNCIÓN PARA VISUALIZAR EL DOCUMENTO (FORZAR VISTA PREVIA) ---
  verDocumento(base64Data: string) {
    if (!base64Data) {
      alert('No hay ningún documento adjunto para este registro.');
      return;
    }

    try {
      // 1. Extraemos el tipo de archivo y la data pura
      let mime = 'application/pdf'; // Por defecto asumimos PDF
      let base64String = base64Data;

      if (base64Data.includes(',')) {
        const arr = base64Data.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (mimeMatch) mime = mimeMatch[1];
        base64String = arr[1];
      }

      // 2. Decodificamos el texto Base64 a datos binarios
      const bstr = atob(base64String);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      // 3. Creamos el Archivo Virtual (Blob)
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      // 4. Forzamos la vista previa escribiendo un visor nativo en la nueva pestaña
      const visorWindow = window.open('', '_blank');

      if (visorWindow) {
        visorWindow.document.write(`
          <html style="margin: 0; padding: 0; height: 100%;">
            <head>
              <title>Vista Previa - Acta de Baja</title>
            </head>
            <body style="margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #525659;">
              <!-- La etiqueta embed obliga a Chrome/Edge/Firefox a usar su visor interno de PDFs o Imágenes -->
              <embed src="${blobUrl}" type="${mime}" width="100%" height="100%" style="border: none;"></embed>
            </body>
          </html>
        `);
        visorWindow.document.close(); // Cerramos el flujo de escritura para que renderice

        // Limpiamos la memoria del navegador después de 1 minuto para evitar fugas de memoria
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } else {
        alert('El navegador bloqueó la ventana. Por favor, permite las ventanas emergentes (pop-ups).');
      }

    } catch (error) {
      console.error('Error al decodificar el documento:', error);
      alert('Hubo un error al intentar abrir la vista previa del documento. Es posible que el archivo esté corrupto.');
    }
  }

  filtrarBajas() {
    if (!this.busquedaGlobal) {
      this.bajasFiltradas = [...this.bajasTotales];
      return;
    }

    const busqueda = this.busquedaGlobal.toLowerCase();
    this.bajasFiltradas = this.bajasTotales.filter(item =>
      (item.usuario || item.custodio || '').toLowerCase().includes(busqueda) ||
      (item.dependencia || item.oficina || '').toLowerCase().includes(busqueda) ||
      (item.codigoBien || item.codigoAB || '').toLowerCase().includes(busqueda) ||
      (item.informeBaja || '').toLowerCase().includes(busqueda) ||
      (item.motivoBaja || '').toLowerCase().includes(busqueda) ||
      (item.componenteBaja || '').toLowerCase().includes(busqueda)
    );
  }

  abrirDetalles(item: any) {
    this.itemSeleccionado = item;
  }

  cerrarDetalles() {
    this.itemSeleccionado = null;
  }
}
