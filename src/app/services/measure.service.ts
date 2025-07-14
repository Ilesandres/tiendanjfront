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


  getAllMeasures(): Observable<Measure[]> {
    return this.http.get<Measure[]>(`${this.apiUrl}/typemeasuremedida/all`);
  }


  getMeasureById(id: number): Observable<Measure> {
    return this.http.get<Measure>(`${this.apiUrl}/typemeasuremedida/id/${id}`);
  }


  getMeasureByName(name: string): Observable<Measure> {
    return this.http.get<Measure>(`${this.apiUrl}/typemeasuremedida/name/${name}`);
  }


  createMeasure(measureData: CreateMeasureRequest): Observable<Measure> {
    const headers = this.getAuthHeaders();
    return this.http.post<Measure>(`${this.apiUrl}/typemeasuremedida/create`, measureData, { headers });
  }


  updateMeasure(id: number, measureData: UpdateMeasureRequest): Observable<Measure> {
    const headers = this.getAuthHeaders();
    return this.http.post<Measure>(`${this.apiUrl}/typemeasuremedida/update/${id}`, measureData, { headers });
  }


  deleteMeasure(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/typemeasuremedida/delete/${id}`, { headers });
  }
} 
