import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';

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
    name: string;
  };
}

export interface User {
  id: number;
  user: string;
  rol: string;
  verify: boolean;
  people: People;
  verificationCode?: any;
  token?: any;
  datesendverify?: any;
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

export interface UpdateUserRequest {
  people?: {
    name?: string;
    lastname?: string;
    phone?: string;
    birthdate?: string;
    email?: string;
    typeDni?: { id: number };
    dni?: string;
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

  // Métodos para obtener información del usuario desde el backend
  getUserById(id: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/auth/user/info/id/${id}`, { headers }).pipe(
      map((user: any) => ({
        ...user,
        rol: typeof user.rol === 'object' ? user.rol.rol : user.rol,

      }
    )),

    );
  }

  getUserByUsername(username: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/auth/user/info/username/${username}`, { headers }).pipe(
      map((user: any) => ({
        ...user,
        rol: typeof user.rol === 'object' ? user.rol.rol : user.rol
      }))
    );
  }

  getUserByEmail(email: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/auth/user/info/email/${email}`, { headers }).pipe(
      map((user: any) => ({
        ...user,
        rol: typeof user.rol === 'object' ? user.rol.rol : user.rol
      }))
    );
  }

  searchUserByDni(dni: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/auth/user/info/dni/${dni}`, { headers }).pipe(
      map((user: any) => ({
        ...user,
        rol: typeof user.rol === 'object' ? user.rol.rol : user.rol
      }))
    );
  }

  // Métodos para crear y actualizar usuarios
  createUser(userData: CreateUserRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/auth/register/user`, userData, { headers });
  }

  updateUser(userId: number, userData: UpdateUserRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/auth/update/user/${userId}`, userData, { headers });
  }

  // Métodos para bloquear/desbloquear usuarios (solo admin)
  blockUser(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/auth/block/user/${userId}`, {}, { headers });
  }

  unblockUser(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/auth/unblock/user/${userId}`, {}, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
} 