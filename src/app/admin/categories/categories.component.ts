import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../interfaces/category.interface';
import { ErrorFiltersService } from '../../interceptors/error.filters';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingCategory: Category | null = null;
  formData = {
    category: ''
  };

  constructor(
    private categoryService: CategoryService,
    private errorFilter:ErrorFiltersService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';
    
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las categorías';
        this.loading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditing && this.editingCategory) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory(): void {
    const categoryData: CreateCategoryRequest = {
      category: this.formData.category
    };

    this.categoryService.createCategory(categoryData).subscribe({
      next: (newCategory) => {
        this.categories.push(newCategory);
        this.resetForm();
        this.error = '';
      },
      error: (error) => {        
        console.error('Error creating category:', error);
            this.error = error?.error?.message || 'error al crear la categoria';
            this.errorFilter.handle(error);
      }
    });
  }

  updateCategory(): void {
    if (!this.editingCategory) return;

    const categoryData: UpdateCategoryRequest = {
      category: this.formData.category
    };

    this.categoryService.updateCategory(this.editingCategory.id, categoryData).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        this.resetForm();
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al actualizar la categoría';
        console.error('Error updating category:', error);
      }
    });
  }

  editCategory(category: Category): void {
    this.isEditing = true;
    this.editingCategory = category;
    this.formData.category = category.category;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  toggleCategoryStatus(category: Category): void {
    const action = category.active ? 
      this.categoryService.disableCategory(category.id) :
      this.categoryService.enableCategory(category.id);

    action.subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(c => c.id === category.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        this.error = '';
      },
      error: (error) => {
        this.error = 'Error al cambiar el estado de la categoría';
        console.error('Error toggling category status:', error);
      }
    });
  }

  deleteCategory(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== id);
          this.error = '';
        },
        error: (error) => {
          this.error = 'Error al eliminar la categoría';
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.isEditing = false;
    this.editingCategory = null;
    this.formData.category = '';
  }
} 
