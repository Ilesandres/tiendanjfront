import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Spice, CreateSpiceRequest, UpdateSpiceRequest } from '../interfaces/spice.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpiceService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los sabores
  getAllSpices(): Observable<Spice[]> {
    return this.http.get<Spice[]>(`${this.apiUrl}/spice/all`);
  }

  // Obtener sabor por ID
  getSpiceById(id: number): Observable<Spice> {
    return this.http.get<Spice>(`${this.apiUrl}/spice/id/${id}`);
  }

  // Obtener sabor por nombre
  getSpiceByName(name: string): Observable<Spice> {
    return this.http.get<Spice>(`${this.apiUrl}/spice/name/${name}`);
  }

  // Crear nuevo sabor (admin, seller)
  createSpice(spiceData: CreateSpiceRequest): Observable<Spice> {
    const headers = this.getAuthHeaders();
    return this.http.post<Spice>(`${this.apiUrl}/spice/create`, spiceData, { headers });
  }

  // Actualizar sabor (admin, seller)
  updateSpice(id: number, spiceData: UpdateSpiceRequest): Observable<Spice> {
    const headers = this.getAuthHeaders();
    return this.http.post<Spice>(`${this.apiUrl}/spice/update/${id}`, spiceData, { headers });
  }

  // Eliminar sabor (admin)
  deleteSpice(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/spice/delete/${id}`, { headers });
  }
} 