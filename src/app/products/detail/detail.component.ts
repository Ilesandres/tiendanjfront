import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductVariation } from '../../interfaces/product.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class DetailComponent implements OnInit {
  product: Product | null = null;
  variations: ProductVariation[] = [];
  loading = false;
  loadingVariations = false;
  error: string | null = null;

  private readonly placeholderImage = 'https://placehold.co/400x200?text=Producto';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public userService: UserService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam);
      if (!isNaN(id) && id > 0) {
        this.loadProduct(id);
      } else {
        this.error = 'ID de producto inválido';
        this.loading = false;
      }
    } else {
      this.error = 'ID de producto no encontrado';
      this.loading = false;
    }
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.loadProductVariations(id);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        if (err.status === 404) {
          this.error = 'Producto no encontrado';
        } else if (err.status === 0) {
          this.error = 'Error de conexión con el servidor';
        } else {
          this.error = 'Error al cargar el producto';
        }
        this.loading = false;
      }
    });
  }

  loadProductVariations(productId: number): void {
    this.loadingVariations = true;
    
    this.productService.getVariationsByProductId(productId).subscribe({
      next: (variations) => {
        this.variations = variations;
        this.loadingVariations = false;
      },
      error: (err) => {
        console.error('Error loading variations:', err);
        this.variations = [];
        this.loadingVariations = false;
      }
    });
  }

  getProductImage(product: Product): string {
    if (!product.image || product.image.trim() === '') {
      return this.placeholderImage;
    }
    
    return product.image;
  }

  getVariationImage(variation: ProductVariation): string {
    if (variation.image && variation.image.trim() !== '') {
      return variation.image;
    }
    
    if (this.product && this.product.image && this.product.image.trim() !== '') {
      return this.product.image;
    }
    
    return this.placeholderImage;
  }

  onImageError(event: any): void {
    event.target.src = this.placeholderImage;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  goToAllVariations(): void {
    this.router.navigate(['/products/variations']);
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

  editProduct(): void {
    if (this.product) {
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }

  deleteProduct(): void {
    if (this.product && confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error = 'Error al eliminar el producto';
          console.error('Error deleting product:', err);
        }
      });
    }
  }

  toggleProductStatus(): void {
    if (this.product) {
      this.productService.changeProductStatus(this.product.id).subscribe({
        next: () => {
          this.loadProduct(this.product!.id);
        },
        error: (err) => {
          this.error = 'Error al cambiar el estado del producto';
          console.error('Error toggling product status:', err);
        }
      });
    }
  }
  editVariation(variationId: number): void {
    this.router.navigate(['/products/variations/edit', variationId]);
  }

  deleteVariation(variationId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta variación?')) {
      this.productService.deleteVariation(variationId).subscribe({
        next: () => {
          if (this.product) {
            this.loadProductVariations(this.product.id);
          }
        },
        error: (err) => {
          this.error = 'Error al eliminar la variación';
          console.error('Error deleting variation:', err);
        }
      });
    }
  }

  toggleVariationStatus(variationId: number): void {
    this.productService.changeVariationStatus(variationId).subscribe({
      next: () => {
        if (this.product) {
          this.loadProductVariations(this.product.id);
        }
      },
      error: (err) => {
        this.error = 'Error al cambiar el estado de la variación';
        console.error('Error toggling variation status:', err);
      }
    });
  }

  updateVariationStock(variationId: number, newStock: number): void {
    this.productService.updateVariationStock(variationId, { stock: newStock }).subscribe({
      next: () => {
        if (this.product) {
          this.loadProductVariations(this.product.id);
        }
      },
      error: (err) => {
        this.error = 'Error al actualizar el stock de la variación';
        console.error('Error updating variation stock:', err);
      }
    });
  }


  getTotalVariations(): number {
    return this.variations?.length || 0;
  }

  getActiveVariations(): number {
    return this.variations?.filter(v => v.active)?.length || 0;
  }
}
