import { Component, inject } from '@angular/core';
import { AutoServiceService } from '../../service/auto-service.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-autos',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './editar-autos.component.html',
  styleUrl: './editar-autos.component.css'
})
export class EditarAutosComponent {
  servicio=inject(AutoServiceService)
  ruta=inject(ActivatedRoute)

  id:any
modelo:any
placa:any
anio:any
precio:any
kilometraje:any
duenioAnterior:any

ngOnInit(){
  this.ruta.params.subscribe(parametro=>{
    this.servicio.getauto(parametro['idAutos']).subscribe(p=>{
      this.id=p.id
      this.modelo=p.modelo
      this.placa=p.placa
      this.anio=p.anio
      this.precio=p.precio
      this.kilometraje=p.kilometraje
      this.duenioAnterior=p.duenioAnterior
    })
  })

  
}
editar(data:any){
  this.servicio.putAuto(data.value).subscribe()
  location.href='gestion'
}


}
