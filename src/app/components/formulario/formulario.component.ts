import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoServiceService } from '../../service/auto-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  servicio = inject(AutoServiceService)
id:any
usuario:any
dependencia:any
hostname:any
tipo:any
modelo:any
codbinecpu:any
seriecpu:any
codbienmonitor:any
seriemonitor:any
codbienmouse:any
seriemouse:any
codbienteclado:any
serieteclado:any
codbienups:any
serieups:any
estadoups:any
tipodisco:any



guardar(data:any){
  this.servicio.postAuto(data.value).subscribe()
  this.limpiar()
  window.location.reload()
  alert("Menaje Recibido")
}
limpiar(){
  this.id='',
this.usuario='',
this.dependencia='',
this.hostname='',
this.tipo='',
this.modelo='',
this.codbinecpu='',
this.seriecpu='',
this.codbienmonitor='',
this.seriemonitor='',
this.codbienmouse='',
this.seriemouse='',
this.codbienteclado='',
this.serieteclado='',
this.codbienups='',
this.serieups='',
this.estadoups='',
this.tipodisco=''


}

}
