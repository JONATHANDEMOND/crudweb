import { Component } from '@angular/core';
import { TablaComponent } from "../../components/tabla/tabla.component";
import { FormularioComponent } from "../../components/formulario/formulario.component";

@Component({
  selector: 'app-gestion-autos',
  standalone: true,
  imports: [TablaComponent, FormularioComponent],
  templateUrl: './gestion-autos.component.html',
  styleUrl: './gestion-autos.component.css'
})
export class GestionAutosComponent {

}
