import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, UserInfo } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class NavbarComponent implements OnInit {
  userInfo: UserInfo | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Solo obtener información del usuario si está autenticado
    if (this.isAuthenticated()) {
      this.userInfo = this.userService.getUserInfo();
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
