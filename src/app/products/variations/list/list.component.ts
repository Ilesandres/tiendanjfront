import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ProductVariation } from '../../../interfaces/product.interface';
import { UserService } from '../../../services/user.service';
import { ErrorFiltersService } from '../../../interceptors/error.filters';

@Component({
  selector: 'app-variations-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class VariationsListComponent implements OnInit {
  variations: ProductVariation[] = [];
  loading = false;
  error: string | null = null;
  
  get totalVariations(): number {
    return this.variations.length;
  }

  get activeVariations(): number {
    return this.variations.filter(v => v.active).length;
  }

  get variationsWithStock(): number {
    return this.variations.filter(v => v.stock > 0).length;
  }
  
  private readonly placeholderImage = 'https://placehold.co/400x200?text=Variación';

  constructor(
    private productService: ProductService,
    private router: Router,
    public userService: UserService,
    private errorFilter: ErrorFiltersService
  ) { }

  ngOnInit(): void {
    this.loadVariations();
  }

  loadVariations(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAllVariations().subscribe({
      next: (variations) => {
        this.variations = variations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading variations:', err);
        this.error = 'Error al cargar las variaciones';
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  getVariationImage(variation: ProductVariation): string {
    if (variation.image && variation.image.trim() !== '') {
      return variation.image;
    }
    
    if (variation.product && variation.product.image && variation.product.image.trim() !== '') {
      return variation.product.image;
    }
    
    return this.placeholderImage;
  }

  onImageError(event: any): void {
    event.target.src = this.placeholderImage;
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  editVariation(variationId: number): void {
    this.router.navigate(['/products/variations/edit', variationId]);
  }

  deleteVariation(variationId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta variación?')) {
      this.productService.deleteVariation(variationId).subscribe({
        next: () => {
          this.loadVariations();
        },
        error: (err) => {
          this.error = 'Error al eliminar la variación';
          console.error('Error deleting variation:', err);
          this.errorFilter.handle(err);
        }
      });
    }
  }

  toggleVariationStatus(variationId: number): void {
    this.productService.changeVariationStatus(variationId).subscribe({
      next: () => {
        this.loadVariations();
      },
      error: (err) => {
        this.error = 'Error al cambiar el estado de la variación';
        console.error('Error toggling variation status:', err);
        this.errorFilter.handle(err);
      }
    });
  }

  updateVariationStock(variationId: number, newStock: number): void {
    this.productService.updateVariationStock(variationId, { stock: newStock }).subscribe({
      next: () => {
        this.loadVariations();
      },
      error: (err) => {
        this.error = 'Error al actualizar el stock de la variación';
        console.error('Error updating variation stock:', err);
        this.errorFilter.handle(err);
      }
    });
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

  goBack(): void {
    this.router.navigate(['/products']);
  }
} 