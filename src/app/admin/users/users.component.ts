import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserManagementService, User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../../services/user-management.service';
import { TypeDniService, TypeDni } from '../../services/typedni.service';
import { RolService, Rol } from '../../services/rol.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  typeDnis: TypeDni[] = [];
  roles: Rol[] = [];
  loading = false;
  error = '';
  success = '';

  // Form states
  showCreateForm = false;
  editingUser: User | null = null;
  creatingUser = false;
  updatingUser = false;
  blockingUser = false;

  // User form
  userForm: FormGroup;

  // Search
  searchTerm = '';
  searchType = 'dni'; // dni, email, username
  
  // Advanced filters
  showAdvancedFilters = false;
  advancedFilters: UserFilters = {
    name: '',
    lastname: '',
    email: '',
    dni: '',
    user: ''
  };

  // Validación personalizada para teléfono (10 dígitos sin espacios)
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // Campo opcional
    
    const phone = control.value.toString().replace(/\s/g, ''); // Remover espacios
    if (phone.length !== 10) {
      return { phoneLength: { required: 10, actual: phone.length } };
    }
    
    if (!/^\d{10}$/.test(phone)) {
      return { phoneFormat: true };
    }
    
    return null;
  }

  // Validación personalizada para DNI (10 dígitos sin espacios)
  private dniValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // Campo requerido, se maneja con Validators.required
    
    const dni = control.value.toString().replace(/\s/g, ''); // Remover espacios
    if (dni.length !== 10) {
      return { dniLength: { required: 10, actual: dni.length } };
    }
    
    if (!/^\d{10}$/.test(dni)) {
      return { dniFormat: true };
    }
    
    return null;
  }

  constructor(
    private userService: UserManagementService,
    private typeDniService: TypeDniService,
    private rolService: RolService,
    private errorFilter: ErrorFiltersService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      people: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        lastname: ['', [Validators.required, Validators.minLength(2)]],
        phone: ['', [this.phoneValidator.bind(this)]],
        birthdate: [''],
        email: ['', [Validators.email]],
        typeDni: this.fb.group({
          id: ['', Validators.required]
        }),
        dni: ['', [Validators.required, this.dniValidator.bind(this)]]
      }),
      user: [''],
      password: [''],
      rol: this.fb.group({
        id: ['']
      }),
      verify: [true]
    });
  }

  ngOnInit(): void {
    this.loadTypeDnis();
    this.loadRoles();
    this.loadInitialUsers();
  }

  loadTypeDnis(): void {
    this.typeDniService.getAllTypes().subscribe({
      next: (typeDnis: TypeDni[]) => {
        this.typeDnis = typeDnis;
      },
      error: (err: any) => {
        console.error('Error loading type DNIs:', err);
        this.error = 'Error al cargar tipos de documento. Algunas funcionalidades pueden no estar disponibles.';
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  loadRoles(): void {
    this.rolService.getAllRoles().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
      },
      error: (err: any) => {
        console.error('Error loading roles:', err);
        this.error = 'Error al cargar roles. Algunas funcionalidades pueden no estar disponibles.';
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  loadInitialUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loading = false;
        if (users.length === 0) {
          this.error = 'No se encontraron usuarios. Use la búsqueda para encontrar usuarios específicos o cree uno nuevo.';
        } else {
          this.success = `Se cargaron ${users.length} usuario(s) exitosamente.`;
          setTimeout(() => this.success = '', 4000);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Error al cargar usuarios. Verifique su conexión e intente nuevamente.';
        console.error('Error loading users:', err);
        this.errorFilter.handle(err);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  // Search user
  searchUser(): void {
    if (!this.searchTerm.trim()) {
      this.error = 'Ingrese un término de búsqueda';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.loading = true;
    this.error = '';

    let searchObservable;
    switch (this.searchType) {
      case 'dni':
        searchObservable = this.userService.getUserByDni(this.searchTerm);
        console.log(`cargando url por dni  param${this.searchTerm}`);
        break;
      case 'email':
        searchObservable = this.userService.getUserByEmail(this.searchTerm);
        break;
      case 'username':
        searchObservable = this.userService.getUserByUsername(this.searchTerm);
        break;
      default:
        this.error = 'Tipo de búsqueda no válido';
        this.loading = false;
        setTimeout(() => this.error = '', 3000);
        return;
    }

    searchObservable.subscribe({
      next: (user) => {
        this.users = [user];
        this.loading = false;
        this.success = 'Usuario encontrado exitosamente';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err: any) => {
        this.error = 'Usuario no encontrado. Verifique los datos ingresados.';
        this.loading = false;
        this.errorFilter.handle(err);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  // Clear search and show all loaded users
  clearSearch(): void {
    this.searchTerm = '';
    this.error = '';
    this.success = '';
    this.loadInitialUsers();
  }

  // Toggle advanced filters
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    if (!this.showAdvancedFilters) {
      this.clearAdvancedFilters();
    }
  }

  // Apply advanced filters
  applyAdvancedFilters(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    // Remove empty filters
    const filters: UserFilters = {};
    Object.keys(this.advancedFilters).forEach(key => {
      const value = this.advancedFilters[key as keyof UserFilters];
      if (value && value.toString().trim() !== '') {
        filters[key as keyof UserFilters] = value;
      }
    });

    this.userService.getUsersByFilters(filters).subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loading = false;
        if (users.length === 0) {
          this.error = 'No se encontraron usuarios con los filtros especificados.';
        } else {
          this.success = `Se encontraron ${users.length} usuario(s) con los filtros aplicados.`;
          setTimeout(() => this.success = '', 4000);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Error al aplicar los filtros. Verifique su conexión e intente nuevamente.';
        console.error('Error applying filters:', err);
        this.errorFilter.handle(err);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  // Clear advanced filters
  clearAdvancedFilters(): void {
    this.advancedFilters = {
      name: '',
      lastname: '',
      email: '',
      dni: '',
      user: ''
    };
    this.loadInitialUsers();
  }

  // Create user
  showCreateUserForm(): void {
    this.showCreateForm = true;
    this.editingUser = null;
    this.resetForm();
  }

  hideCreateUserForm(): void {
    this.showCreateForm = false;
    this.editingUser = null;
    this.resetForm();
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.error = 'Por favor complete todos los campos requeridos';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.creatingUser = true;
    this.error = '';

    const formValue = this.userForm.value;
    const userData: CreateUserRequest = {
      people: formValue.people,
      user: formValue.user || undefined,
      password: formValue.password || undefined,
      rol: formValue.rol.id ? { id: formValue.rol.id } : undefined,
      verify: formValue.verify
    };

    this.userService.createUser(userData).subscribe({
      next: (newUser) => {
        this.users.unshift(newUser);
        this.success = 'Usuario creado exitosamente';
        this.hideCreateUserForm();
        this.creatingUser = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al crear el usuario. Verifique los datos ingresados.';
        this.creatingUser = false;
        this.errorFilter.handle(err);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  // Edit user
  editUser(user: User): void {
    this.editingUser = user;
    this.showCreateForm = false;
    this.populateForm(user);
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.resetForm();
  }

  updateUser(): void {
    if (this.userForm.invalid || !this.editingUser) {
      this.error = 'Por favor complete todos los campos requeridos';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.updatingUser = true;
    this.error = '';

    const formValue = this.userForm.value;
    const updateData: UpdateUserRequest = {
      people: formValue.people,
      user: formValue.user || undefined,
      password: formValue.password || undefined,
      rol: formValue.rol.id ? { id: formValue.rol.id } : undefined,
      verify: formValue.verify
    };

    this.userService.updateUser(this.editingUser.id!, updateData).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.success = 'Usuario actualizado exitosamente';
        this.editingUser = null;
        this.resetForm();
        this.updatingUser = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al actualizar el usuario. Verifique los datos ingresados.';
        this.updatingUser = false;
        this.errorFilter.handle(err);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  // Block/Unblock user
  toggleUserStatus(user: User): void {
    if (this.blockingUser) return;

    this.blockingUser = true;
    this.error = '';

    const action = user.verify ? 
      this.userService.blockUser(user.id!) : 
      this.userService.unblockUser(user.id!);

    action.subscribe({
      next: () => {
        user.verify = !user.verify;
        this.success = `Usuario ${user.verify ? 'desbloqueado' : 'bloqueado'} exitosamente`;
        this.blockingUser = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err: any) => {
        this.error = `Error al ${user.verify ? 'bloquear' : 'desbloquear'} el usuario. Intente nuevamente.`;
        this.blockingUser = false;
        this.errorFilter.handle(err);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  // Form helpers
  private resetForm(): void {
    this.userForm.reset({
      people: {
        name: '',
        lastname: '',
        phone: '',
        birthdate: '',
        email: '',
        typeDni: { id: '' },
        dni: ''
      },
      user: '',
      password: '',
      rol: { id: '' },
      verify: true
    });
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      people: {
        name: user.people.name,
        lastname: user.people.lastname,
        phone: user.people.phone || '',
        birthdate: user.people.birthdate || '',
        email: user.people.email || '',
        typeDni: { id: user.people.typeDni.id },
        dni: user.people.dni
      },
      user: user.user || '',
      password: '',
      rol: { id: user.rol?.id || '' },
      verify: user.verify
    });
  }

  // Check if current user is admin
  isAdmin(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    try {
      // Decode JWT token (payload is the second part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol === 'admin';
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  // Check if current user is seller
  isSeller(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    try {
      // Decode JWT token (payload is the second part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol === 'vendedor';
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  // Get user type display name
  getUserType(user: User): string {
    if (!user.rol) return 'Cliente';
    switch (user.rol.rol) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'cliente': return 'Cliente';
      case 'proveedor': return 'Proveedor';
      default: return 'Usuario';
    }
  }

  // Get status badge class
  getStatusClass(user: User): string {
    return user.verify ? 'status-active' : 'status-blocked';
  }

  // Get status text
  getStatusText(user: User): string {
    return user.verify ? 'Activo' : 'Bloqueado';
  }

  // Formatear teléfono automáticamente
  onPhoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    event.target.value = value;
  }

  // Formatear DNI automáticamente
  onDniInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    event.target.value = value;
  }

  // Obtener longitud del teléfono
  getPhoneLength(): number {
    const phoneValue = this.userForm.get('people.phone')?.value;
    return phoneValue ? phoneValue.toString().replace(/\s/g, '').length : 0;
  }

  // Obtener longitud del DNI
  getDniLength(): number {
    const dniValue = this.userForm.get('people.dni')?.value;
    return dniValue ? dniValue.toString().replace(/\s/g, '').length : 0;
  }

  // Verificar si el teléfono está completo
  isPhoneComplete(): boolean {
    return this.getPhoneLength() === 10;
  }

  // Verificar si el DNI está completo
  isDniComplete(): boolean {
    return this.getDniLength() === 10;
  }
} 