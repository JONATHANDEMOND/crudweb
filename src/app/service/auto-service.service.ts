import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoServiceService {

  constructor(private http:HttpClient) { }
private API_AUTOS ="http://localhost:3000/autos"

//LEER
getAutos():Observable<any>{
  return this.http.get(this.API_AUTOS)
}
getauto(id:string):Observable<any>{
  return this.http.get(this.API_AUTOS+"/"+id)
}

//ESCRIBIR - GUARDAR
postAuto(auto:any):Observable<any>{
  return this.http.post(this.API_AUTOS, auto )
}

//ELIMINAR
deleteAuto(id:string):Observable<any>{
  return this.http.delete(`${this.API_AUTOS}/${id}`)
}
//EDITAR
putAuto(auto:any):Observable<any>{
  return this.http.put(`${this.API_AUTOS}/${auto.id}`, auto)
}

}
