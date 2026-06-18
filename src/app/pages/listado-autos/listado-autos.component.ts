import { Component } from '@angular/core';
import { TablaComponent } from "../../components/tabla/tabla.component";


@Component({
  selector: 'app-listado-autos',
  standalone: true,
  imports: [TablaComponent, ],
  templateUrl: './listado-autos.component.html',
  styleUrl: './listado-autos.component.css'
})
export class ListadoAutosComponent {

}
