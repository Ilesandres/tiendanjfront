import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeasureService } from '../../services/measure.service';
import { Measure, CreateMeasureRequest, UpdateMeasureRequest } from '../../interfaces/measure.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-measures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.css']
})
export class MeasuresComponent implements OnInit {
  measures: Measure[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingMeasure: Measure | null = null;
  formData = {
    measure: ''
  };

  constructor(
    private measureService: MeasureService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadMeasures();
  }

  loadMeasures(): void {
    this.loading = true;
    this.error = '';
    
    this.measureService.getAllMeasures().subscribe({
      next: (measures) => {
        this.measures = measures;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las unidades de medida';
        this.loading = false;
        console.error('Error loading measures:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditing && this.editingMeasure) {
      this.updateMeasure();
    } else {
      this.createMeasure();
    }
  }

  createMeasure(): void {
    const measureData: CreateMeasureRequest = {
      measure: this.formData.measure
    };

    this.measureService.createMeasure(measureData).subscribe({
      next: (newMeasure) => {
        this.measures.push(newMeasure);
        this.resetForm();
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al crear la unidad de medida';
        console.error('Error creating measure:', error);
      }
    });
  }

  updateMeasure(): void {
    if (!this.editingMeasure) return;

    const measureData: UpdateMeasureRequest = {
      measure: this.formData.measure
    };

    this.measureService.updateMeasure(this.editingMeasure.id, measureData).subscribe({
      next: (updatedMeasure) => {
        const index = this.measures.findIndex(m => m.id === this.editingMeasure!.id);
        if (index !== -1) {
          this.measures[index] = updatedMeasure;
        }
        this.resetForm();
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al actualizar la unidad de medida';
        console.error('Error updating measure:', error);
      }
    });
  }

  editMeasure(measure: Measure): void {
    this.isEditing = true;
    this.editingMeasure = measure;
    this.formData.measure = measure.measure;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteMeasure(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta unidad de medida?')) {
      this.measureService.deleteMeasure(id).subscribe({
        next: () => {
          this.measures = this.measures.filter(m => m.id !== id);
          this.error = '';
        },
        error: (error) => {
          this.error = 'Error al eliminar la unidad de medida';
          console.error('Error deleting measure:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.isEditing = false;
    this.editingMeasure = null;
    this.formData.measure = '';
  }
} 