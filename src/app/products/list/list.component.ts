import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, Category, Spice, Measure } from '../../interfaces/product.interface';
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
  spices: Spice[] = [];
  measures: Measure[] = [];
  loading = false;
  error: string | null = null;
  
  filters = {
    category: null as number | null,
    name: '',
    variationActive: null as string | null,
    active: null as boolean | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    spice: null as number | null,
    measure: null as number | null
  };

  showFilters = false;

  private readonly placeholderImage = 'https://placehold.co/400x200?text=Producto';

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private errorFilter: ErrorFiltersService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSpices();
    this.loadMeasures();
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

  loadSpices(): void {
    this.productService.getAllSpices().subscribe({
      next: (spices) => {
        this.spices = spices;
      },
      error: (err) => {
        console.error('Error loading spices:', err);
      }
    });
  }

  loadMeasures(): void {
    this.productService.getAllMeasures().subscribe({
      next: (measures) => {
        this.measures = measures;
      },
      error: (err) => {
        console.error('Error loading measures:', err);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    const filters: any = {};
    
    if (this.filters.category) {
      filters.category = { id: this.filters.category };
    }
    
    if (this.filters.name && this.filters.name.trim() !== '') {
      filters.name = this.filters.name.trim();
    }
    
    if (this.filters.variationActive !== null) {
      filters.variationActive = this.filters.variationActive;
    }
    
    if (this.filters.active !== null) {
      filters.active = this.filters.active;
    }
    
    if (this.filters.minPrice !== null) {
      filters.minPrice = this.filters.minPrice;
    }
    
    if (this.filters.maxPrice !== null) {
      filters.maxPrice = this.filters.maxPrice;
    }
    
    if (this.filters.spice) {
      filters.spice = { id: this.filters.spice };
    }
    
    if (this.filters.measure) {
      filters.measure = { id: this.filters.measure };
    }

    if (Object.keys(filters).length === 0) {
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
    } else {
      this.productService.getProductsWithFilters(filters).subscribe({
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
    
    if (product.image && product.image.trim() !== '') {
      return product.image;
    }
    
    if (product.variation && product.variation.length > 0) {
      
      const variationsWithImage = product.variation.filter(
        (variation: any) => variation.image && variation.image.trim() !== ''
      );
      
      
      if (variationsWithImage.length > 0) {
        const selectedIndex = product.id % variationsWithImage.length;
        const selectedImage = variationsWithImage[selectedIndex].image;
        return selectedImage;
      }
    }
    
    return this.placeholderImage;
  }

  onImageError(event: any): void {
    event.target.src = this.placeholderImage;
  }

  onCategoryChange(): void {
    this.loadProducts();
  }

  onFilterChange(): void {
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters = {
      category: null,
      name: '',
      variationActive: null,
      active: null,
      minPrice: null,
      maxPrice: null,
      spice: null,
      measure: null
    };
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
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
