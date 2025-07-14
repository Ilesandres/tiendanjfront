import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, LoginResponse, RegisterUserRequest, UpdateUserRequest } from '../interfaces/auth.interface';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private authStatusSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.authStatusSubject.next(this.isAuthenticated());
  }


  get authStatus$(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }


  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {

        if (response.acces_token) {
          this.setToken(response.acces_token);
          this.authStatusSubject.next(true);
        }
      })
    );
  }


  registerUser(userData: RegisterUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/user`, userData);
  }


  updateUser(userId: number, userData: UpdateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/update/user/${userId}`, userData);
  }


  blockUser(userId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/auth/block/user/${userId}`, {});
  }


  unblockUser(userId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/auth/unblock/user/${userId}`, {});
  }


  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
      this.authStatusSubject.next(true);
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
      this.authStatusSubject.next(false);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }


  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol || null;
    } catch (e) {
      return null;
    }
  }
} 
