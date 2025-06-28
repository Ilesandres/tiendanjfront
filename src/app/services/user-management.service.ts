import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface People {
  id?: number;
  name: string;
  lastname: string;
  phone?: string;
  birthdate?: string;
  email?: string;
  typeDni: {
    id: number;
    name?: string;
  };
  dni: string;
}

export interface User {
  id?: number;
  people: People;
  user?: string;
  password?: string;
  verificationCode?: string;
  token?: string;
  datesendverify?: string;
  rol?: {
    id: number;
    rol?: string;
  };
  verify: boolean;
}

export interface CreateUserRequest {
  people: People;
  user?: string;
  password?: string;
  rol?: {
    id: number;
  };
  verify?: boolean;
}

export interface UpdateUserRequest {
  people?: People;
  user?: string;
  password?: string;
  rol?: {
    id: number;
  };
  verify?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Create user (client, seller, admin)
  createUser(data: CreateUserRequest): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.post<User>(`${this.apiUrl}/auth/register/user`, data, { headers });
  }

  // Update user
  updateUser(id: number, data: UpdateUserRequest): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.post<User>(`${this.apiUrl}/auth/update/user/${id}`, data, { headers });
  }

  // Block user (change verify status)
  blockUser(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/auth/block/user/${id}`, {}, { headers });
  }

  // Unblock user (change verify status)
  unblockUser(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/auth/unblock/user/${id}`, {}, { headers });
  }

  // Get user by ID
  getUserById(id: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/auth/user/info/id/${id}`, { headers });
  }

  // Get user by DNI
  getUserByDni(dni: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/auth/user/info/dni/${dni}`, { headers });
  }

  // Get user by email
  getUserByEmail(email: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/auth/user/info/email/${email}`, { headers });
  }

  // Get user by username
  getUserByUsername(username: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/auth/user/info/username/${username}`, { headers });
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/auth/users/list`, { headers });
  }
} 