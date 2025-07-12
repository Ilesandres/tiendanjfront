import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, UserInfo } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class NavbarComponent implements OnInit, OnDestroy {
  userInfo: UserInfo | null = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios de autenticación
    this.authSubscription = this.authService.authStatus$.subscribe(isAuthenticated => {
      this.updateUserInfo();
    });

    // Obtener información inicial del usuario si está autenticado
    this.updateUserInfo();
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción al destruir el componente
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateUserInfo(): void {
    if (this.isAuthenticated()) {
      this.userInfo = this.userService.getUserInfo();
    } else {
      this.userInfo = null;
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  isSeller(): boolean {
    return this.userService.isSeller();
  }

  logout(): void {
    this.authService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}
