import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      people: this.fb.group({
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        phone: [''],
        birthdate: [''],
        email: ['', [Validators.email]],
        typeDni: this.fb.group({
          id: [1, Validators.required]
        }),
        dni: ['', Validators.required]
      }),
      user: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: this.fb.group({
        id: [2, Validators.required] // 2 = cliente por defecto
      }),
      verify: [true]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    
    this.loading = true;
    this.error = null;
    this.success = null;

    this.authService.registerUser(this.registerForm.value).subscribe({
      next: (res) => {
        this.success = 'Usuario registrado exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }
}
