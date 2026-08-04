import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../service/auto-service.service';

@Component({
  selector: 'app-cronograma-sr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cronograma-sr.component.html',
  styleUrls: ['./cronograma-sr.component.css']
})
export class CronogramaSrComponent implements OnInit {
  servicio = inject(AutoServiceService);

  equiposSR: any[] = [];
  impresorasSR: any[] = [];
  inventarioTotal: any[] = [];

  fechaInicio: string = '';
  fechaFin: Date | null = null;
  equiposPorDia: number = 5;

  // NUEVO: Objeto para controlar qué días se sale a campo (0=Dom, 1=Lun... 6=Sáb)
  diasLaborables: { [key: number]: boolean } = {
    1: true,  // Lunes
    2: true,  // Martes
    3: true,  // Miércoles
    4: true,  // Jueves
    5: true,  // Viernes
    6: false, // Sábado
    0: false  // Domingo
  };

  cronogramaGenerado: { fecha: Date, equipos: any[] }[] = [];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.servicio.getAutos().subscribe(pcs => {
      this.equiposSR = pcs || [];
      this.servicio.getImpresorasSR().subscribe(impresoras => {
        this.impresorasSR = impresoras || [];
        this.inventarioTotal = [...this.equiposSR, ...this.impresorasSR];
      });
    });
  }

  generarCronograma() {
    if (!this.fechaInicio) {
      alert('Por favor, selecciona una fecha de inicio en el calendario.');
      return;
    }

    if (this.inventarioTotal.length === 0) {
      alert('No hay equipos registrados en Sitios Remotos.');
      return;
    }

    // SEGURIDAD: Verificar que al menos un día esté seleccionado
    const algunDiaSeleccionado = Object.values(this.diasLaborables).some(valor => valor === true);
    if (!algunDiaSeleccionado) {
      alert('Debes seleccionar al menos un día de la semana para salir a campo.');
      return;
    }

    this.cronogramaGenerado = [];
    let fechaActual = new Date(this.fechaInicio + 'T00:00:00');
    let indiceEquipo = 0;
    let totalEquipos = this.inventarioTotal.length;

    while (indiceEquipo < totalEquipos) {
      // 1. Comprobar si el día de la semana actual está marcado como "true"
      let diaDeLaSemana = fechaActual.getDay();

      if (!this.diasLaborables[diaDeLaSemana]) {
        // Si no está marcado (ej. Miércoles apagado, o es fin de semana), saltamos al siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1);
        continue;
      }

      // 2. Extraer los equipos
      let equiposDelDia = this.inventarioTotal.slice(indiceEquipo, indiceEquipo + this.equiposPorDia);

      // 3. Guardarlos
      this.cronogramaGenerado.push({
        fecha: new Date(fechaActual),
        equipos: equiposDelDia
      });

      // 4. Avanzar índices
      indiceEquipo += this.equiposPorDia;
      if (indiceEquipo < totalEquipos) {
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    }

    this.fechaFin = this.cronogramaGenerado.length > 0
      ? this.cronogramaGenerado[this.cronogramaGenerado.length - 1].fecha
      : null;
  }
}
