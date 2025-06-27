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
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log("error redata")
        console.log(error)
        if (error.status === 401) {
          // Solo ejecutar en el navegador (no en SSR)
            console.log('limpiando')
            // Limpiar localStorage
            localStorage.clear();
            
            // Redirigir al login
            this.router.navigate(['/auth/login']);
          
        }
        
        return throwError(() => error);
      })
    );
  }
} 