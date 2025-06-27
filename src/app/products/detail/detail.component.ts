import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductVariation } from '../../interfaces/product.interface';

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

  // URL del placeholder para imágenes
  private readonly placeholderImage = 'https://placehold.co/400x200?text=Producto';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
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
        // Cargar las variaciones del producto
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
        console.log('Variaciones cargadas:', variations);
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
    // Si no hay imagen o está vacía, usar placeholder
    if (!product.image || product.image.trim() === '') {
      return this.placeholderImage;
    }
    
    // Si hay imagen, usarla
    return product.image;
  }

  getVariationImage(variation: ProductVariation): string {
    // Si la variación tiene imagen, usarla
    if (variation.image && variation.image.trim() !== '') {
      return variation.image;
    }
    
    // Si no, usar la imagen del producto
    if (this.product && this.product.image && this.product.image.trim() !== '') {
      return this.product.image;
    }
    
    // Finalmente, usar placeholder
    return this.placeholderImage;
  }

  onImageError(event: any): void {
    // Si la imagen falla al cargar, usar placeholder
    event.target.src = this.placeholderImage;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
