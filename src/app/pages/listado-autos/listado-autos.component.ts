import { Component } from '@angular/core';
import { TablaComponent } from "../../components/tabla/tabla.component";
import { TablaListadoComponent } from "../../components/tabla-listado/tabla-listado.component";

@Component({
  selector: 'app-listado-autos',
  standalone: true,
  imports: [TablaComponent, TablaListadoComponent],
  templateUrl: './listado-autos.component.html',
  styleUrl: './listado-autos.component.css'
})
export class ListadoAutosComponent {

}
