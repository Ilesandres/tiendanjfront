import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, UserInfo } from '../../services/user.service';
import { ThemeService, Theme } from '../../services/theme.service';
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
  currentTheme: Theme = 'light';
  private authSubscription: Subscription | null = null;
  private themeSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.authSubscription = this.authService.authStatus$.subscribe(isAuthenticated => {
      this.updateUserInfo();
    });


    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });


    this.updateUserInfo();
  }

  ngOnDestroy(): void {

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
