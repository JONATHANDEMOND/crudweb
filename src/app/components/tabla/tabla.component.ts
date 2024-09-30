import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../../service/auto-service.service';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css'
})
export class TablaComponent {
  servicio = inject(AutoServiceService);
  autos: any[] = [];
  vehiculosFiltrados: any[] = [];
  
  precioDesde: number = 0;
  precioHasta: number = 2000000;

  ngOnInit() {
    this.servicio.getAutos().subscribe(p => {
      this.autos = p;
      this.vehiculosFiltrados = [...this.autos]; // Inicializar con todos los autos
    });
  }

  eliminar(id: string) {
    this.servicio.deleteAuto(id).subscribe(() => {
      this.autos = this.autos.filter(aut => aut.id !== id);
      this.filtrarVehiculos();
    });
  }

  filtrarVehiculos() {
    this.vehiculosFiltrados = this.autos.filter(aut => {
      const precio = Number(aut.precio); // Convertir a número
      return precio >= this.precioDesde && precio <= this.precioHasta;
    });
  }

  // Método trackBy para optimizar *ngFor
  trackById(index: number, item: any) {
    return item.id;
  }
}
