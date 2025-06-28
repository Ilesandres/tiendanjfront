import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Rol {
  id: number;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/rol`);
  }

  getRoleById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/rol/id/${id}`);
  }

  getRoleByName(name: string): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/rol/name/${name}`);
  }
} 