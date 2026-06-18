import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoServiceService {

  constructor(private http: HttpClient) { }

  private API_AUTOS = "http://localhost:3000/autos";
  private API_USUARIOS = "http://localhost:3000/usuarios";
  private API_EDFCENTRAL = "http://localhost:3000/edificioCentral";

  // --- MÉTODOS DE AUTOS ---
  getAutos(): Observable<any> { return this.http.get(this.API_AUTOS); }
  postAuto(auto: any): Observable<any> { return this.http.post(this.API_AUTOS, auto); }
  deleteAuto(id: string): Observable<any> { return this.http.delete(`${this.API_AUTOS}/${id}`); }
  //---METODO DE EDIFICIO CENTRAL---//
  getEdificioCentral(): Observable<any> { return this.http.get(this.API_EDFCENTRAL); }
  postEdificioCentral(edificio: any): Observable<any> { return this.http.post(this.API_EDFCENTRAL, edificio); }
  deleteEdificioCentral(id: string): Observable<any> { return this.http.delete(`${this.API_EDFCENTRAL}/${id}`); }


  // --- MÉTODOS DE USUARIOS ---
  updateAuto(id: any, equipo: any) {
  // Asegúrate de que la URL coincida con la que usas para 'getAutos'
  return this.http.put(`http://localhost:3000/autos/${id}`, equipo);
}

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.API_USUARIOS);
  }

  postUsuario(usuario: any): Observable<any> {
    return this.http.post(this.API_USUARIOS, usuario);
  }

  deleteUsuario(id: any): Observable<any> {
    return this.http.delete(`${this.API_USUARIOS}/${id}`);
  }

  // VALIDAR LOGIN CORREGIDO
 login(user: string, pass: string): Observable<any> {
  return this.http.get<any[]>(this.API_USUARIOS).pipe(
    map(usuarios => {
      // Buscamos que coincida el nombre de usuario (en cualquier campo) y la contraseña
      return usuarios.find(u =>
        (u.usuario === user || u.user === user) && u.pass === pass
      ) || null;
    })
  );
}
}
