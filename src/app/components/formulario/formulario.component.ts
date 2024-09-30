import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../../service/auto-service.service';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  servicio = inject(AutoServiceService)
id:any
modelo:any
placa:any
anio:any
precio:any
kilometraje:any
duenioAnterior:any

guardar(data:any){
  this.servicio.postAuto(data.value).subscribe()
  this.limpiar()
  window.location.reload()
  alert("Menaje Recibido")
}
limpiar(){
  this.id='',
this.modelo='',
this.placa='',
this.anio='',
this.precio='',
this.kilometraje='',
this.duenioAnterior=''


}

}
