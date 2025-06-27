import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserInfo {
  id: number;
  user: string;
  rol: string;
  verify: boolean;
}

export interface People {
  id: number;
  name: string;
  lastname: string;
  phone?: string;
  birthdate?: string;
  email?: string;
  dni: string;
  typeDni: {
    id: number;
    type: string;
  };
}

export interface User {
  id: number;
  user: string;
  rol: string;
  verify: boolean;
  people: People;
}

export interface CreateUserRequest {
  people: {
    name: string;
    lastname: string;
    phone?: string;
    birthdate?: string;
    email?: string;
    typeDni: { id: number };
    dni: string;
  };
  user?: string;
  password?: string;
  rol?: { id: number };
  verify?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getUserInfo(): UserInfo | null {
    const token = this.authService.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[DEBUG] Usuario decodificado del token:', payload);
      return {
        id: payload.id,
        user: payload.user,
        rol: payload.rol,
        verify: payload.verify
      };
    } catch (error) {
      return null;
    }
  }

  getUserRole(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.rol : null;
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin';
  }

  isSeller(): boolean {
    const role = this.getUserRole();
    return role === 'vendedor';
  }

  isClient(): boolean {
    const role = this.getUserRole();
    return role === 'cliente';
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  // Nuevos métodos para buscar y crear usuarios
  searchUserByDni(dni: string): Observable<User> {
    // Usar el endpoint correcto según Postman
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/auth/user/info/dni/${dni}`, { headers });
  }

  createUser(userData: CreateUserRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/auth/register/user`, userData, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
} 