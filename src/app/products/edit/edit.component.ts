import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, Category, CreateProductRequest, UpdateProductRequest } from '../../interfaces/product.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditComponent implements OnInit {
  product: Product | null = null;
  categories: Category[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  
  formData = {
    product: '',
    category: null as number | null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam);
      if (!isNaN(id) && id > 0) {
        this.loadProduct(id);
      } else {
        this.error = 'ID de producto inválido';
      }
    } else {
      this.error = 'ID de producto no encontrado';
    }
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = 'Error al cargar categorías';
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.formData.product = product.product;
        this.formData.category = product.category?.id || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        if (err.status === 404) {
          this.error = 'Producto no encontrado';
        } else {
          this.error = 'Error al cargar el producto';
        }
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.product) return;

    this.saving = true;
    this.error = null;

    const updateData: UpdateProductRequest = {
      product: this.formData.product,
      category: this.formData.category ? { id: this.formData.category } : undefined
    };

    this.productService.updateProduct(this.product.id, updateData).subscribe({
      next: (updatedProduct) => {
        this.saving = false;
        this.router.navigate(['/products', this.product!.id]);
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al actualizar el producto';
        console.error('Error updating product:', err);
      }
    });
  }

  cancel(): void {
    if (this.product) {
      this.router.navigate(['/products', this.product.id]);
    } else {
      this.router.navigate(['/products']);
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
} 
