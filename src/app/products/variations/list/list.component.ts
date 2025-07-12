import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ProductVariation } from '../../../interfaces/product.interface';
import { UserService } from '../../../services/user.service';
import { ErrorFiltersService } from '../../../interceptors/error.filters';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../interfaces/product.interface';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): { text: string; match: boolean }[] {
    if (!search) return [{ text, match: false }];
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    return parts.map(part => ({ text: part, match: regex.test(part) && part.toLowerCase() === search.toLowerCase() }));
  }
}

@Component({
  selector: 'app-variations-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightPipe]
})
export class VariationsListComponent implements OnInit {
  variations: ProductVariation[] = [];
  loading = false;
  error: string | null = null;

  // Autocompletado de productos
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productSearch: string = '';
  selectedProduct: Product | null = null;
  autocompleteOpen: boolean = false;
  blurTimeout: any;

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
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
      },
      error: (err) => {
        this.error = 'Error al cargar productos para autocompletar';
        this.errorFilter.handle(err);
      }
    });
  }

  onProductSearchChange(): void {
    const search = this.productSearch.trim().toLowerCase();
    this.filteredProducts = this.products.filter(p => p.product.toLowerCase().includes(search));
    this.autocompleteOpen = !!search && this.filteredProducts.length > 0 && !this.selectedProduct;
  }

  onInputFocus(): void {
    if (this.productSearch.trim() && this.filteredProducts.length > 0 && !this.selectedProduct) {
      this.autocompleteOpen = true;
    }
  }

  onInputBlur(): void {
    // Esperar un poco para permitir el click en la lista
    this.blurTimeout = setTimeout(() => {
      this.autocompleteOpen = false;
    }, 120);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.productSearch = product.product;
    this.filteredProducts = [];
    this.autocompleteOpen = false;
    this.loadVariationsByProduct(product.id);
    if (this.blurTimeout) clearTimeout(this.blurTimeout);
  }

  loadVariationsByProduct(productId: number): void {
    this.loading = true;
    this.error = null;
    this.productService.getVariationsByProductId(productId).subscribe({
      next: (variations) => {
        this.variations = variations;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar variaciones del producto';
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  clearProductSearch(): void {
    this.selectedProduct = null;
    this.productSearch = '';
    this.filteredProducts = this.products;
    this.autocompleteOpen = false;
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