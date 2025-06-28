import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shipment {
  id: number;
  order: {
    id: number;
  };
  status: {
    id: number;
    status: string;
  };
  details: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShipmentRequest {
  order: {
    id: number;
  };
  status: {
    id: number;
  };
  details: string;
}

export interface UpdateShipmentRequest {
  order: {
    id: number;
  };
  status: {
    id: number;
  };
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllShipments(): Observable<Shipment[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Shipment[]>(`${this.apiUrl}/shipment/all`, { headers });
  }

  getShipmentById(id: number): Observable<Shipment> {
    const headers = this.getAuthHeaders();
    return this.http.get<Shipment>(`${this.apiUrl}/shipment/id/${id}`, { headers });
  }

  getShipmentByOrderId(orderId: number): Observable<Shipment> {
    const headers = this.getAuthHeaders();
    return this.http.get<Shipment>(`${this.apiUrl}/shipment/order/${orderId}`, { headers });
  }

  createShipment(data: CreateShipmentRequest): Observable<Shipment> {
    const headers = this.getAuthHeaders();
    return this.http.post<Shipment>(`${this.apiUrl}/shipment/create`, data, { headers });
  }

  updateShipment(id: number, data: UpdateShipmentRequest): Observable<Shipment> {
    const headers = this.getAuthHeaders();
    return this.http.post<Shipment>(`${this.apiUrl}/shipment/update/${id}`, data, { headers });
  }

  deleteShipment(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/shipment/delete/${id}`, { headers });
  }
} 