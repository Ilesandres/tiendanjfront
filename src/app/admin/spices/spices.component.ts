import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpiceService } from '../../services/spice.service';
import { Spice, CreateSpiceRequest, UpdateSpiceRequest } from '../../interfaces/spice.interface';

@Component({
  selector: 'app-spices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spices.component.html',
  styleUrls: ['./spices.component.css']
})
export class SpicesComponent implements OnInit {
  spices: Spice[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingSpice: Spice | null = null;
  formData = {
    spice: ''
  };

  constructor(private spiceService: SpiceService) {}

  ngOnInit(): void {
    this.loadSpices();
  }

  loadSpices(): void {
    this.loading = true;
    this.error = '';
    
    this.spiceService.getAllSpices().subscribe({
      next: (spices) => {
        this.spices = spices;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los sabores';
        this.loading = false;
        console.error('Error loading spices:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditing && this.editingSpice) {
      this.updateSpice();
    } else {
      this.createSpice();
    }
  }

  createSpice(): void {
    const spiceData: CreateSpiceRequest = {
      spice: this.formData.spice
    };

    this.spiceService.createSpice(spiceData).subscribe({
      next: (newSpice) => {
        this.spices.push(newSpice);
        this.resetForm();
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al crear el sabor';
        console.error('Error creating spice:', error);
      }
    });
  }

  updateSpice(): void {
    if (!this.editingSpice) return;

    const spiceData: UpdateSpiceRequest = {
      spice: this.formData.spice
    };

    this.spiceService.updateSpice(this.editingSpice.id, spiceData).subscribe({
      next: (updatedSpice) => {
        const index = this.spices.findIndex(s => s.id === this.editingSpice!.id);
        if (index !== -1) {
          this.spices[index] = updatedSpice;
        }
        this.resetForm();
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al actualizar el sabor';
        console.error('Error updating spice:', error);
      }
    });
  }

  editSpice(spice: Spice): void {
    this.isEditing = true;
    this.editingSpice = spice;
    this.formData.spice = spice.spice;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteSpice(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este sabor?')) {
      this.spiceService.deleteSpice(id).subscribe({
        next: () => {
          this.spices = this.spices.filter(s => s.id !== id);
          this.error = '';
        },
        error: (error) => {
          this.error = 'Error al eliminar el sabor';
          console.error('Error deleting spice:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.isEditing = false;
    this.editingSpice = null;
    this.formData.spice = '';
  }
} 