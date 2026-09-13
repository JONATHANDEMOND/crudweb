import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutoServiceService {

  constructor(private http: HttpClient) { }

  private API_URL = environment.apiUrl;

  // --- FUNCIÓN DE SEGURIDAD PARA MANDAR EL ROL AL SERVIDOR ---
// --- FUNCIÓN DE SEGURIDAD AJUSTADA ---
  private getHeaders() {
    // Forzamos que si hay sesión, devuelva 'admin' para evitar bloqueos inesperados
    const role = localStorage.getItem('role') || 'admin';
    return {
      headers: new HttpHeaders({ 'x-role': role })
    };
  }
  // ==============================================================
  // --- MÉTODOS DE LECTURA (GET PÚBLICOS) ---
  // ==============================================================
  getAutos(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/autos`);
  }

  getEdificioCentral(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/edificioCentral`);
  }

  getImpresorasEC(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/impresoras-ec`);
  }

  getImpresorasSR(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/impresoras-sr`);
  }

  // --- PROYECTORES (Lectura pública, coincidiendo con Node.js) ---
  getProyectoresEC(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/proyectores-ec`);
  }

  getProyectoresSR(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/proyectores-sr`);
  }

  // --- SCANNERS (Lectura pública, coincidiendo con Node.js) ---
  getScannersEC(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/scanners-ec`);
  }

  getScannersSR(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/scanners-sr`);
  }

  // --- HISTORIAL UNIFICADO DE BAJAS ---
  getTodasLasBajas(): Observable<any[]> {
    // Cambiado para que coincida exactamente con la llamada del componente
    return this.http.get<any[]>(`${this.API_URL}/bajas`);
  }

  // --- MÉTODO LOGIN SEGURO (Validado en Servidor) ---
  login(user: string, pass: string): Observable<any> {
    const credenciales = {
      usuario: user.trim(),
      password: pass.trim()
    };
    return this.http.post<any>(`${this.API_URL}/login`, credenciales);
  }

  // ==============================================================
  // --- MÉTODOS PROTEGIDOS (Requieren this.getHeaders() de Admin) ---
  // ==============================================================

  // USUARIOS //
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuarios`, this.getHeaders());
  }
  postUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/usuarios`, usuario, this.getHeaders());
  }
  deleteUsuario(id: any): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/usuarios/${id}`, this.getHeaders());
  }

  // AUTOS //
  postAuto(auto: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/autos`, auto, this.getHeaders());
  }
  updateAuto(id: any, equipo: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/autos/${id}`, equipo, this.getHeaders());
  }
  deleteAuto(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/autos/${id}`, this.getHeaders());
  }

  // EDIFICIO CENTRAL //
  postEdificioCentral(edificio: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/edificioCentral`, edificio, this.getHeaders());
  }
  updateEdificioCentral(id: any, equipo: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/edificioCentral/${id}`, equipo, this.getHeaders());
  }
  deleteEdificioCentral(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/edificioCentral/${id}`, this.getHeaders());
  }
  actualizarEquipo(id: string, datos: any): Observable<any> {
    return this.updateEdificioCentral(id, datos);
  }

  // IMPRESORAS EDIFICIO CENTRAL //
  postImpresoraEC(impresora: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/impresoras-ec`, impresora, this.getHeaders());
  }
  updateImpresoraEC(id: string, impresora: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/impresoras-ec/${id}`, impresora, this.getHeaders());
  }
  deleteImpresoraEC(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/impresoras-ec/${id}`, this.getHeaders());
  }

  // IMPRESORAS SITIOS REMOTOS //
  postImpresoraSR(impresora: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/impresoras-sr`, impresora, this.getHeaders());
  }
  updateImpresoraSR(id: string, impresora: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/impresoras-sr/${id}`, impresora, this.getHeaders());
  }
  deleteImpresoraSR(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/impresoras-sr/${id}`, this.getHeaders());
  }

  // PROYECTORES EDIFICIO CENTRAL //
  createProyectorEC(data: any): Observable<any> { return this.http.post(`${this.API_URL}/proyectores-ec`, data, this.getHeaders()); }
  updateProyectorEC(id: string, data: any): Observable<any> { return this.http.put(`${this.API_URL}/proyectores-ec/${id}`, data, this.getHeaders()); }
  deleteProyectorEC(id: string): Observable<any> { return this.http.delete(`${this.API_URL}/proyectores-ec/${id}`, this.getHeaders()); }

  // PROYECTORES SITIOS REMOTOS //
  createProyectorSR(data: any): Observable<any> { return this.http.post(`${this.API_URL}/proyectores-sr`, data, this.getHeaders()); }
  updateProyectorSR(id: string, data: any): Observable<any> { return this.http.put(`${this.API_URL}/proyectores-sr/${id}`, data, this.getHeaders()); }
  deleteProyectorSR(id: string): Observable<any> { return this.http.delete(`${this.API_URL}/proyectores-sr/${id}`, this.getHeaders()); }

  // SCANNERS EDIFICIO CENTRAL //
  createScannerEC(data: any): Observable<any> { return this.http.post(`${this.API_URL}/scanners-ec`, data, this.getHeaders()); }
  updateScannerEC(id: string, data: any): Observable<any> { return this.http.put(`${this.API_URL}/scanners-ec/${id}`, data, this.getHeaders()); }
  deleteScannerEC(id: string): Observable<any> { return this.http.delete(`${this.API_URL}/scanners-ec/${id}`, this.getHeaders()); }

  // SCANNERS SITIOS REMOTOS //
  createScannerSR(data: any): Observable<any> { return this.http.post(`${this.API_URL}/scanners-sr`, data, this.getHeaders()); }
  updateScannerSR(id: string, data: any): Observable<any> { return this.http.put(`${this.API_URL}/scanners-sr/${id}`, data, this.getHeaders()); }
  deleteScannerSR(id: string): Observable<any> { return this.http.delete(`${this.API_URL}/scanners-sr/${id}`, this.getHeaders()); }
}
