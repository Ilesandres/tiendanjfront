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


  getAllColors(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.apiUrl}/color/all`);
  }


  getColorById(id: number): Observable<Color> {
    return this.http.get<Color>(`${this.apiUrl}/color/id/${id}`);
  }


  getColorByName(name: string): Observable<Color> {
    return this.http.get<Color>(`${this.apiUrl}/color/name/${name}`);
  }


  createColor(colorData: CreateColorRequest): Observable<Color> {
    const headers = this.getAuthHeaders();
    return this.http.post<Color>(`${this.apiUrl}/color/create`, colorData, { headers });
  }


  updateColor(id: number, colorData: UpdateColorRequest): Observable<Color> {
    const headers = this.getAuthHeaders();
    return this.http.post<Color>(`${this.apiUrl}/color/update/${id}`, colorData, { headers });
  }


  deleteColor(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/color/delte/${id}`, { headers });
  }
} 
