import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importamos Router para navegar
import { AutoServiceService } from '../../service/auto-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formulario-central', // CORREGIDO: Selector único
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './formulario-central.component.html',
  styleUrl: './formulario-central.component.css'
})
export class FormularioCentralComponent {
  servicio = inject(AutoServiceService);
  router = inject(Router); // Inyectamos Router

  // CORREGIDO: Nombres de variables idénticos a los de tu db.json
  id: any = '';
  usuario: any = '';
  dependencia: any = '';
  hostname: any = '';
  tipo: any = '';
  modelo: any = '';
  codigoBien: any = ''; // Antes codbinecpu
  numeroSerie: any = ''; // Antes seriecpu
  codigoBienMonitor: any = '';
  numeroSerieMonitor: any = '';
  codigoBienMouse: any = '';
  numeroSerieMouse: any = '';
  codigoBienTeclado: any = '';
  numeroSerieTeclado: any = '';
  codigoBienUps: any = '';
  numeroSerieUps: any = '';
  estadoups: any = '';
  tipoDisco: any = '';

  guardar(data: any) {
    // Al usar data.value, Angular tomará los nombres de los atributos 'name' de tu HTML.
    // Asegúrate de que en el HTML los 'name' coincidan con estas variables.
    this.servicio.postEdificioCentral(data.value).subscribe(() => {
      this.limpiar();
      alert("✅ Equipo registrado correctamente");
      // Te redirige suavemente a la tabla del edificio central
      this.router.navigate(['/listadoedfcent']);
    });
  }

  limpiar() {
    this.usuario = '';
    this.dependencia = '';
    this.hostname = '';
    this.tipo = '';
    this.modelo = '';
    this.codigoBien = '';
    this.numeroSerie = '';
    this.codigoBienMonitor = '';
    this.numeroSerieMonitor = '';
    this.codigoBienMouse = '';
    this.numeroSerieMouse = '';
    this.codigoBienTeclado = '';
    this.numeroSerieTeclado = '';
    this.codigoBienUps = '';
    this.numeroSerieUps = '';
    this.estadoups = '';
    this.tipoDisco = '';
  }
}
