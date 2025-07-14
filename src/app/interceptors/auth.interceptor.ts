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

    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('auth_token');
    }


    let modifiedRequest = request;
    if (token) {
      modifiedRequest = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }


    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        
        if (error.status === 401) {
          

          if (isPlatformBrowser(this.platformId)) {

            localStorage.clear();
            

            this.router.navigate(['/auth/login']);
          }
        }
        
        return throwError(() => error);
      })
    );
  }
} 
