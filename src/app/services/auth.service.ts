import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, LoginResponse, RegisterUserRequest, UpdateUserRequest } from '../interfaces/auth.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  // Register user
  registerUser(userData: RegisterUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/user`, userData);
  }

  // Update user
  updateUser(userId: number, userData: UpdateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/update/user/${userId}`, userData);
  }

  // Block user (admin only)
  blockUser(userId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/auth/block/user/${userId}`, {});
  }

  // Unblock user (admin only)
  unblockUser(userId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/auth/unblock/user/${userId}`, {});
  }

  // Token management
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
} 