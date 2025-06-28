import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, Category } from '../../interfaces/product.interface';
import { UserService } from '../../services/user.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  selectedCategory: number | null = null;

  // URL del placeholder para imágenes
  private readonly placeholderImage = 'https://placehold.co/400x200?text=Producto';

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private errorFilter: ErrorFiltersService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    if (this.selectedCategory) {
      this.productService.getProductsByCategory(this.selectedCategory).subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos';
          this.loading = false;
        }
      });
    } else {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos';
          this.loading = false;
        }
      });
    }
  }

  getProductImage(product: Product): string {
    // Si no hay imagen o está vacía, usar placeholder
    if (!product.image || product.image.trim() === '') {
      return this.placeholderImage;
    }
    
    // Si hay imagen, usarla
    return product.image;
  }

  onImageError(event: any): void {
    // Si la imagen falla al cargar, usar placeholder
    event.target.src = this.placeholderImage;
  }

  onCategoryChange(): void {
    this.loadProducts();
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

  editProduct(productId: number): void {
    this.router.navigate(['/products/edit', productId]);
  }

  deleteProduct(productId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          // Recargar la lista de productos
          this.loadProducts();
        },
        error: (err) => {
          this.error = 'Error al eliminar el producto';
          console.error('Error deleting product:', err);
        }
      });
    }
  }

  toggleProductStatus(productId: number): void {
    this.productService.changeProductStatus(productId).subscribe({
      next: () => {
        // Recargar la lista de productos
        this.loadProducts();
      },
      error: (err) => {
        this.error = 'Error al cambiar el estado del producto';
        console.error('Error toggling product status:', err);
        this.errorFilter.handle(err);
      }
    });
  }
}
