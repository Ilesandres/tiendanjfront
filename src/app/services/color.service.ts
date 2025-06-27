import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Color, CreateColorRequest, UpdateColorRequest } from '../interfaces/color.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
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

  // Obtener todos los colores
  getAllColors(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.apiUrl}/color/all`);
  }

  // Obtener color por ID
  getColorById(id: number): Observable<Color> {
    return this.http.get<Color>(`${this.apiUrl}/color/id/${id}`);
  }

  // Obtener color por nombre
  getColorByName(name: string): Observable<Color> {
    return this.http.get<Color>(`${this.apiUrl}/color/name/${name}`);
  }

  // Crear nuevo color (admin, seller)
  createColor(colorData: CreateColorRequest): Observable<Color> {
    const headers = this.getAuthHeaders();
    return this.http.post<Color>(`${this.apiUrl}/color/create`, colorData, { headers });
  }

  // Actualizar color (admin, seller)
  updateColor(id: number, colorData: UpdateColorRequest): Observable<Color> {
    const headers = this.getAuthHeaders();
    return this.http.post<Color>(`${this.apiUrl}/color/update/${id}`, colorData, { headers });
  }

  // Eliminar color (admin)
  deleteColor(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/color/delte/${id}`, { headers });
  }
} 