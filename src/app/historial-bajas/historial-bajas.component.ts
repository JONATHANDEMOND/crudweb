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
    this.autoService.getTodasLasBajas().subscribe({
      next: (data: any) => {
        this.bajasTotales = data;
        this.filtrarBajas();
      },
      error: (err) => console.error("Error al obtener bajas:", err)
    });
  }

  filtrarBajas() {
    if (!this.busquedaGlobal) {
      this.bajasFiltradas = [...this.bajasTotales];
      return;
    }
    const busqueda = this.busquedaGlobal.toLowerCase();
    this.bajasFiltradas = this.bajasTotales.filter(item =>
      (item.usuario || '').toLowerCase().includes(busqueda) ||
      (item.dependencia || '').toLowerCase().includes(busqueda) ||
      (item.codigoBien || '').toLowerCase().includes(busqueda) ||
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

  verDocumento(base64Data: string) {
    if (!base64Data) {
      alert('No hay ningún documento adjunto para este registro.');
      return;
    }
    try {
      let mime = 'application/pdf';
      let base64String = base64Data;
      if (base64Data.includes(',')) {
        const arr = base64Data.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (mimeMatch) mime = mimeMatch[1];
        base64String = arr[1];
      }
      const bstr = atob(base64String);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const visorWindow = window.open('', '_blank');
      if (visorWindow) {
        visorWindow.document.write(`
          <html style="margin: 0; padding: 0; height: 100%;">
            <body style="margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #525659;">
              <embed src="${blobUrl}" type="${mime}" width="100%" height="100%" style="border: none;"></embed>
            </body>
          </html>
        `);
        visorWindow.document.close();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } else {
        alert('El navegador bloqueó la ventana. Por favor, permite las ventanas emergentes (pop-ups).');
      }
    } catch (error) {
      console.error('Error al decodificar el documento:', error);
      alert('Hubo un error al intentar abrir la vista previa del documento.');
    }
  }
}
