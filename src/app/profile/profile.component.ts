import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User, UpdateUserRequest } from '../services/user.service';
import { TypeDniService, TypeDni } from '../services/typedni.service';
import { ErrorFiltersService } from '../interceptors/error.filters';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = false;
  error: string | null = null;
  editing = false;
  saving = false;
  success = false;
  typeDnis: TypeDni[] = [];

  profileForm: FormGroup;

  constructor(
    private userService: UserService,
    private typeDniService: TypeDniService,
    private fb: FormBuilder,
    private errorFilter: ErrorFiltersService
  ) {

    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      birthdate: [''],
      email: ['', [Validators.email]],
      dni: ['', [Validators.required, Validators.minLength(8)]],
      typeDniId: [1, Validators.required],
      user: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadTypeDnis();
    this.profileForm.disable();
    this.profileForm.get('password')?.disable();
    this.profileForm.get('confirmPassword')?.disable();
  }

  loadTypeDnis(): void {
    console.log('Loading type DNIs...');
    this.typeDniService.getAllTypes().subscribe({
      next: (types: TypeDni[]) => {
        this.typeDnis = types;
        console.log('Type DNIs loaded successfully:', this.typeDnis);

        this.loadUserProfile();
      },
      error: (err) => {
        console.error('Error loading type DNIs:', err);
        this.errorFilter.handle(err);

        this.loadUserProfile();
      }
    });
  }

  loadUserProfile(): void {
    this.loading = true;
    this.error = null;
    

    const currentUser = this.userService.getUserInfo();
    if (!currentUser) {
      this.error = 'No se pudo obtener la información del usuario';
      this.loading = false;
      return;
    }


    this.userService.getUserById(currentUser.id).subscribe({
      next: (user) => {
        this.user = user;
        this.populateForm(user);
        this.loading = false;

        if (!this.editing) {
          this.profileForm.disable();
          this.profileForm.get('password')?.disable();
          this.profileForm.get('confirmPassword')?.disable();
        }
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error = 'Error al cargar el perfil del usuario';
        this.loading = false;
      }
    });
  }

  populateForm(user: User): void {
    console.log('Populating form with user data:', user);
    

    if (!user || !user.people) {
      console.error('User or user.people is null/undefined');
      return;
    }
    
    console.log('User people data:', user.people);
    console.log('Current form structure:', this.profileForm.value);
    
    try {

      this.profileForm.patchValue({
        name: user.people.name || '',
        lastname: user.people.lastname || '',
        phone: user.people.phone || '',
        birthdate: user.people.birthdate || '',
        email: user.people.email || '',
        dni: user.people.dni || '',
        typeDniId: user.people.typeDni?.id || 1,
        user: user.user || '',
        password: '',
        confirmPassword: ''
      });

      console.log('Form values after population:', this.profileForm.value);
      

      setTimeout(() => {
        console.log('Form values after timeout:', this.profileForm.value);
        console.log('Form controls:', this.profileForm.controls);
      }, 100);
    } catch (error) {
      console.error('Error populating form:', error);
    }
  }

  startEditing(): void {
    this.editing = true;
    this.profileForm.enable();
    this.profileForm.get('password')?.enable();
    this.profileForm.get('confirmPassword')?.enable();
  }

  cancelEditing(): void {
    this.editing = false;
    this.saving = false;
    this.loadUserProfile();
    this.profileForm.disable();
    this.profileForm.get('password')?.disable();
    this.profileForm.get('confirmPassword')?.disable();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.profileForm.value;
    const updateData: UpdateUserRequest = {
      people: {
        name: formValue.name,
        lastname: formValue.lastname,
        phone: formValue.phone || undefined,
        birthdate: formValue.birthdate || undefined,
        email: formValue.email || undefined,
        dni: formValue.dni,
        typeDni: {
          id: formValue.typeDniId
        }
      },
      user: formValue.user
    };


    if (formValue.password) {
      updateData.password = formValue.password;
    }

    if (!this.user) {
      this.error = 'No se pudo obtener la información del usuario';
      this.saving = false;
      return;
    }

    this.userService.updateUser(this.user.id, updateData).subscribe({
      next: (response) => {
        this.saving = false;
        this.success = true;
        this.editing = false;
        

        this.loadUserProfile();
        

        setTimeout(() => {
          this.success = false;
        }, 5000);
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al actualizar el perfil';
        this.errorFilter.handle(err);
      }
    });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['email']) {
        return 'Email inválido';
      }
    }
    return null;
  }

  getPasswordError(): string {
    const password = this.profileForm.get('password');
    const confirmPassword = this.profileForm.get('confirmPassword');
    
    if (this.profileForm.errors?.['passwordMismatch'] && confirmPassword?.touched) {
      return 'Las contraseñas no coinciden';
    }
    
    if (password?.invalid && password?.touched) {
      if (password.errors?.['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    
    return '';
  }

  testTypeDniService(): void {
    console.log('Testing TypeDni service...');
    this.typeDniService.getAllTypes().subscribe({
      next: (types) => {
        console.log('Direct service test - Types loaded:', types);
      },
      error: (err) => {
        console.error('Direct service test - Error:', err);
      }
    });
  }

  getTypeDniNames(): string {
    return this.typeDnis?.map(t => t.name).join(', ') || '';
  }
} 
