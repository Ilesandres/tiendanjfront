import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TypeDni {
  id: number;
  name: string;
}

export interface CreateTypeDniRequest {
  name: string;
}

export interface UpdateTypeDniRequest {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypeDniService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllTypes(): Observable<TypeDni[]> {
    return this.http.get<TypeDni[]>(`${this.apiUrl}/typedni/all`);
  }

  getTypeById(id: number): Observable<TypeDni> {
    return this.http.get<TypeDni>(`${this.apiUrl}/typedni/id/${id}`);
  }

  createTypeDni(data: CreateTypeDniRequest): Observable<TypeDni> {
    const headers = this.getAuthHeaders();
    return this.http.post<TypeDni>(`${this.apiUrl}/typedni/create`, data, { headers });
  }

  updateTypeDni(id: number, data: UpdateTypeDniRequest): Observable<TypeDni> {
    const headers = this.getAuthHeaders();
    return this.http.post<TypeDni>(`${this.apiUrl}/typedni/update/${id}`, data, { headers });
  }

  deleteTypeDni(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/typedni/delete/${id}`, { headers });
  }
} 