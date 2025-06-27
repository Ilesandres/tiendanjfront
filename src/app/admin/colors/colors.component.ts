import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorService } from '../../services/color.service';
import { Color, CreateColorRequest, UpdateColorRequest } from '../../interfaces/color.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.css']
})
export class ColorsComponent implements OnInit {
  colors: Color[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingColor: Color | null = null;
  formData = {
    color: ''
  };

  constructor(
    private colorService: ColorService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadColors();
  }

  loadColors(): void {
    this.loading = true;
    this.error = '';
    
    this.colorService.getAllColors().subscribe({
      next: (colors) => {
        this.colors = colors;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los colores';
        this.loading = false;
        console.error('Error loading colors:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditing && this.editingColor) {
      this.updateColor();
    } else {
      this.createColor();
    }
  }

  createColor(): void {
    const colorData: CreateColorRequest = {
      color: this.formData.color
    };

    this.colorService.createColor(colorData).subscribe({
      next: (newColor) => {
        this.colors.push(newColor);
        this.resetForm();
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al crear el color';
        console.error('Error creating color:', error);
      }
    });
  }

  updateColor(): void {
    if (!this.editingColor) return;

    const colorData: UpdateColorRequest = {
      color: this.formData.color
    };

    this.colorService.updateColor(this.editingColor.id, colorData).subscribe({
      next: (updatedColor) => {
        const index = this.colors.findIndex(c => c.id === this.editingColor!.id);
        if (index !== -1) {
          this.colors[index] = updatedColor;
        }
        this.resetForm();
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al actualizar el color';
        console.error('Error updating color:', error);
      }
    });
  }

  editColor(color: Color): void {
    this.isEditing = true;
    this.editingColor = color;
    this.formData.color = color.color;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteColor(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este color?')) {
      this.colorService.deleteColor(id).subscribe({
        next: () => {
          this.colors = this.colors.filter(c => c.id !== id);
          this.error = '';
        },
        error: (error) => {
          this.error = 'Error al eliminar el color';
          console.error('Error deleting color:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.isEditing = false;
    this.editingColor = null;
    this.formData.color = '';
  }
} 