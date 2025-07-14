import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeDniService, TypeDni } from '../../services/typedni.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-typedni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './typedni.component.html',
  styleUrls: ['./typedni.component.css']
})
export class TypeDniComponent implements OnInit {
  typeDnis: TypeDni[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingTypeDni: TypeDni | null = null;
  formData = {
    name: ''
  };

  constructor(
    private typeDniService: TypeDniService,
    private errorFilter: ErrorFiltersService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadTypeDnis();
  }

  loadTypeDnis(): void {
    this.loading = true;
    this.error = '';
    
    this.typeDniService.getAllTypes().subscribe({
      next: (typeDnis: TypeDni[]) => {
        this.typeDnis = typeDnis;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar los tipos de DNI';
        this.loading = false;
        console.error('Error loading type DNIs:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditing && this.editingTypeDni) {
      this.updateTypeDni();
    } else {
      this.createTypeDni();
    }
  }

  createTypeDni(): void {
    const typeDniData = {
      name: this.formData.name
    };

    this.typeDniService.createTypeDni(typeDniData).subscribe({
      next: (newTypeDni: TypeDni) => {
        this.typeDnis.push(newTypeDni);
        this.resetForm();
        this.error = '';
      },
      error: (error: any) => {        
        console.error('Error creating type DNI:', error);
        this.error = error?.error?.message || 'Error al crear el tipo de DNI';
        this.errorFilter.handle(error);
      }
    });
  }

  updateTypeDni(): void {
    if (!this.editingTypeDni) return;

    const typeDniData = {
      name: this.formData.name
    };

    this.typeDniService.updateTypeDni(this.editingTypeDni.id, typeDniData).subscribe({
      next: (updatedTypeDni: TypeDni) => {
        const index = this.typeDnis.findIndex(t => t.id === this.editingTypeDni!.id);
        if (index !== -1) {
          this.typeDnis[index] = updatedTypeDni;
        }
        this.resetForm();
        this.error = '';
      },
      error: (error: any) => {
        this.error = 'Error al actualizar el tipo de DNI';
        console.error('Error updating type DNI:', error);
      }
    });
  }

  editTypeDni(typeDni: TypeDni): void {
    this.isEditing = true;
    this.editingTypeDni = typeDni;
    this.formData.name = typeDni.name;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteTypeDni(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este tipo de DNI?')) {
      this.typeDniService.deleteTypeDni(id).subscribe({
        next: () => {
          this.typeDnis = this.typeDnis.filter(t => t.id !== id);
          this.error = '';
        },
        error: (error) => {
          this.error = 'Error al eliminar el tipo de DNI';
          console.error('Error deleting type DNI:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.isEditing = false;
    this.editingTypeDni = null;
    this.formData.name = '';
  }
} 
