import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoServiceService {

  constructor(private http: HttpClient) { }

  // Apuntamos al nuevo servidor real en Node.js + MongoDB

 private API_URL = 'http://192.168.0.11:4000/api';
  // --- MÉTODOS DE LECTURA (GET) ---

  getAutos(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/autos`);
  }

  getEdificioCentral(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/edificioCentral`);
  }
//USUARIOS //
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuarios`);
  }

postUsuario(usuario: any): Observable<any> {
  return this.http.post<any>(`${this.API_URL}/usuarios`, usuario);
}
  // --- MÉTODO LOGIN ---
  login(user: string, pass: string): Observable<any> {
    // Limpiamos los espacios en blanco accidentales
    const userLimpio = user.trim();
    const passLimpio = pass.trim();

    return this.getUsuarios().pipe(
      map(usuarios => {
        console.log("1. Usuarios desde MongoDB:", usuarios);
        console.log(`2. Intentando entrar con -> Usuario: '${userLimpio}' | Contraseña: '${passLimpio}'`);

        const usuarioEncontrado = usuarios.find(u =>
          (u.usuario === userLimpio || u.user === userLimpio) && u.pass === passLimpio
        );

        if (!usuarioEncontrado) {
          console.warn("3. No hubo coincidencia. Revisa bien las mayúsculas/minúsculas.");
        }

        return usuarioEncontrado || null;
      })
    );
  }

  // --- MÉTODOS DE ESCRITURA (POST/PUT/DELETE) ---
  // Ahora estos métodos se conectan directamente a la base de datos real

  postAuto(auto: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/autos`, auto);
  }

  deleteAuto(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/autos/${id}`);
  }

  updateAuto(id: any, equipo: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/autos/${id}`, equipo);
  }

  postEdificioCentral(edificio: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/edificioCentral`, edificio);
  }

  deleteEdificioCentral(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/edificioCentral/${id}`);
  }

  updateEdificioCentral(id: any, equipo: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/edificioCentral/${id}`, equipo);
  }



  deleteUsuario(id: any): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/usuarios/${id}`);
  }
  actualizarEquipo(id: string, datos: any) {
    return this.http.put(`${this.API_URL}/autos/${id}`, datos);
  }
}
