import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Measure, CreateMeasureRequest, UpdateMeasureRequest } from '../interfaces/measure.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeasureService {
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

  // Obtener todas las unidades de medida
  getAllMeasures(): Observable<Measure[]> {
    return this.http.get<Measure[]>(`${this.apiUrl}/typemeasuremedida/all`);
  }

  // Obtener unidad de medida por ID
  getMeasureById(id: number): Observable<Measure> {
    return this.http.get<Measure>(`${this.apiUrl}/typemeasuremedida/id/${id}`);
  }

  // Obtener unidad de medida por nombre
  getMeasureByName(name: string): Observable<Measure> {
    return this.http.get<Measure>(`${this.apiUrl}/typemeasuremedida/name/${name}`);
  }

  // Crear nueva unidad de medida (admin, seller)
  createMeasure(measureData: CreateMeasureRequest): Observable<Measure> {
    const headers = this.getAuthHeaders();
    return this.http.post<Measure>(`${this.apiUrl}/typemeasuremedida/create`, measureData, { headers });
  }

  // Actualizar unidad de medida (admin, seller)
  updateMeasure(id: number, measureData: UpdateMeasureRequest): Observable<Measure> {
    const headers = this.getAuthHeaders();
    return this.http.post<Measure>(`${this.apiUrl}/typemeasuremedida/update/${id}`, measureData, { headers });
  }

  // Eliminar unidad de medida (admin)
  deleteMeasure(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/typemeasuremedida/delete/${id}`, { headers });
  }
} 