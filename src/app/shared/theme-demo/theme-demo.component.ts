import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-demo',
  templateUrl: './theme-demo.component.html',
  styleUrl: './theme-demo.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class ThemeDemoComponent {
  currentTheme: Theme = 'light';

  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
} 