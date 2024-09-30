import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutoServiceService } from '../../service/auto-service.service';

@Component({
  selector: 'app-tabla-listado',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './tabla-listado.component.html',
  styleUrl: './tabla-listado.component.css'
})
export class TablaListadoComponent {
  servicio=inject(AutoServiceService)
  autos:any
  ngOnInit() {
    this.servicio.getAutos().subscribe(p=>{
      this.autos=p
      this.filtrarVehiculos();
    })
 
  }


precioDesde: number = 1000;
precioHasta: number =500000;
vehiculosFiltrados = this.servicio.getAutos();

filtrarVehiculos() {
  this.vehiculosFiltrados = this.autos.filter((aut: { precio: number; }) => 
    aut.precio >= this.precioDesde && aut.precio <= this.precioHasta
  );
}

}
