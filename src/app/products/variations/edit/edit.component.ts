import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ProductVariation, UpdateVariationRequest } from '../../../interfaces/product.interface';
import { UserService } from '../../../services/user.service';
import { ErrorFiltersService } from '../../../interceptors/error.filters';

@Component({
  selector: 'app-edit-variation',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditVariationComponent implements OnInit {
  variation: ProductVariation | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  
  formData = {
    price: 0,
    stock: 0,
    image: '',
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public userService: UserService,
    private errorFilter: ErrorFiltersService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam);
      if (!isNaN(id) && id > 0) {
        this.loadVariation(id);
      } else {
        this.error = 'ID de variación inválido';
      }
    } else {
      this.error = 'ID de variación no encontrado';
    }
  }

  loadVariation(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getVariationById(id).subscribe({
      next: (variation) => {
        this.variation = variation;
        this.formData.price = variation.price;
        this.formData.stock = variation.stock;
        this.formData.image = variation.image || '';
        this.formData.description = variation.description || '';
        this.loading = false;
        

        console.log('Variación cargada:', variation);
      },
      error: (err) => {
        console.error('Error loading variation:', err);
        if (err.status === 404) {
          this.error = 'Variación no encontrada';
        } else {
          this.error = 'Error al cargar la variación';
        }
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.variation) return;

    this.saving = true;
    this.error = null;


    const updateData: UpdateVariationRequest = {
      price: this.formData.price,
      stock: this.formData.stock
    };


    if (this.formData.image && this.formData.image !== this.variation.image) {
      updateData.image = this.formData.image;
    }


    if (this.formData.description !== this.variation.description) {
      updateData.description = this.formData.description;
    }

    this.productService.updateVariation(this.variation.id, updateData).subscribe({
      next: (updatedVariation) => {
        this.saving = false;

        if (this.variation?.product?.id) {
          this.router.navigate(['/products', this.variation.product.id]);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al actualizar la variación';
        console.error('Error updating variation:', err);
        this.errorFilter.handle(err);
      }
    });
  }

  cancel(): void {
    if (this.variation?.product?.id) {
      this.router.navigate(['/products', this.variation.product.id]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  isSeller(): boolean {
    return this.userService.isSeller();
  }

  canEdit(): boolean {
    return this.isAdmin() || this.isSeller();
  }

  onImageInput(event: any): void {


  }

  getImageLength(): number {
    return this.formData.image ? this.formData.image.length : 0;
  }

  onDescriptionInput(event: any): void {


  }

  getDescriptionLength(): number {
    return this.formData.description ? this.formData.description.length : 0;
  }
} 
