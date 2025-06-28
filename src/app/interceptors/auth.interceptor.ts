import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log("Interceptando petición:", request.url);
    
    // Obtener el token del localStorage (solo en navegador)
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('auth_token');
    }

    // Clonar la petición y agregar el token si existe
    let modifiedRequest = request;
    if (token) {
      modifiedRequest = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Token agregado a la petición");
    }

    // Continuar con la petición modificada
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log("Error en la petición:", error);
        
        if (error.status === 401) {
          console.log('Error 401 - Token inválido o expirado');
          
          // Solo ejecutar en el navegador (no en SSR)
          if (isPlatformBrowser(this.platformId)) {
            // Limpiar localStorage
            localStorage.clear();
            
            // Redirigir al login
            this.router.navigate(['/auth/login']);
          }
        }
        
        return throwError(() => error);
      })
    );
  }
} 