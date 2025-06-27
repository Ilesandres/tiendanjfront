import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorFiltersService {
  constructor(private router: Router) {}

  handle(error: HttpErrorResponse) {
    if (error.status === 401) {
      localStorage.clear();
      this.router.navigate(['/auth/login']);
    }

    return throwError(() => error);
  }
}
