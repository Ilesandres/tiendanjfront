import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as string[];
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const token = authService.getToken();
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.rol;

    if (requiredRoles.includes(userRole)) {
      return true;
    } else {
      router.navigate(['/products']);
      return false;
    }
  } catch (error) {
    router.navigate(['/auth/login']);
    return false;
  }
};
