import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoServiceService {

  constructor(private http: HttpClient) { }

  private API_AUTOS = "http://localhost:3000/autos";
  private API_USUARIOS = "http://localhost:3000/usuarios"; // Nueva URL

  // --- MÉTODOS DE AUTOS (Los que ya tenías) ---
  getAutos(): Observable<any> { return this.http.get(this.API_AUTOS); }
  postAuto(auto: any): Observable<any> { return this.http.post(this.API_AUTOS, auto); }
  deleteAuto(id: string): Observable<any> { return this.http.delete(`${this.API_AUTOS}/${id}`); }

  // --- MÉTODOS DE USUARIOS (Nuevos para el Admin) ---

  // Obtener lista de técnicos para la tabla
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.API_USUARIOS);
  }

  // Guardar nuevo técnico en db.json
  postUsuario(usuario: any): Observable<any> {
    return this.http.post(this.API_USUARIOS, usuario);
  }

  // Eliminar técnico de la base de datos
  deleteUsuario(id: any): Observable<any> {
    return this.http.delete(`${this.API_USUARIOS}/${id}`);
  }

  // VALIDAR LOGIN: Busca si existe un usuario con ese nombre y contraseña
  login(user: string, pass: string): Observable<any> {
    return this.http.get<any[]>(`${this.API_USUARIOS}?user=${user}&pass=${pass}`).pipe(
      map(usuarios => usuarios.length > 0 ? usuarios[0] : null)
    );
  }
}
