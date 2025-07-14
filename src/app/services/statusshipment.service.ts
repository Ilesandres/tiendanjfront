import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StatusShipment {
  id: number;
  status: string;
}

export interface CreateStatusShipmentRequest {
  status: string;
}

export interface UpdateStatusShipmentRequest {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusShipmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllStatuses(): Observable<StatusShipment[]> {
    return this.http.get<StatusShipment[]>(`${this.apiUrl}/statusshipment/all`);
  }

  getStatusById(id: number): Observable<StatusShipment> {
    return this.http.get<StatusShipment>(`${this.apiUrl}/statusshipment/id/${id}`);
  }

  getStatusByName(name: string): Observable<StatusShipment> {
    return this.http.get<StatusShipment>(`${this.apiUrl}/statusshipment/name/${name}`);
  }

  createStatus(data: CreateStatusShipmentRequest): Observable<StatusShipment> {
    const headers = this.getAuthHeaders();
    return this.http.post<StatusShipment>(`${this.apiUrl}/statusshipment/create`, data, { headers });
  }

  updateStatus(id: number, data: UpdateStatusShipmentRequest): Observable<StatusShipment> {
    const headers = this.getAuthHeaders();
    return this.http.post<StatusShipment>(`${this.apiUrl}/statusshipment/update/${id}`, data, { headers });
  }

  deleteStatus(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/statusshipment/delete/${id}`, { headers });
  }
} 
