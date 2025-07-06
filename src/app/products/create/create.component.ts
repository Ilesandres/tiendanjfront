import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';

interface Category {
  id: number;
  category: string;
  active: boolean;
}

interface Spice {
  id: number;
  spice: string;
}

interface Measure {
  id: number;
  measure: string;
}

interface Color {
  id: number;
  color: string;
}

interface Product {
  id: number;
  product: string;
  category?: Category;
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateComponent implements OnInit {
  // Estados del wizard
  currentStep = 1;
  showProductModal = false;
  
  // Formularios
  productForm: FormGroup;
  variationForm: FormGroup;
  
  // Estados de carga
  isLoading = false;
  isInitialLoading = true;
  message = '';
  messageType = '';

  // Datos
  categories: Category[] = [];
  spices: Spice[] = [];
  measures: Measure[] = [];
  colors: Color[] = [];
  products: Product[] = [];
  
  // Producto seleccionado/creado
  selectedProduct: Product | null = null;
  isNewProduct = false;
  filteredProducts: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private errorFilter:ErrorFiltersService
  ) {
    // Formulario para crear producto nuevo
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(2)]],
      category: ['']
    });

    // Formulario para crear variación
    this.variationForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      spice: [''],
      measure: [''],
      color: [''],
      image: ['', [Validators.maxLength(254)]],
      description: ['', [Validators.maxLength(254)]]
    });
  }

  ngOnInit(): void {
    this.testConnection();
  }

  async testConnection(): Promise<void> {
    try {
      console.log('Testing backend connection...');
      const testResult = await this.productService.getCategories();
      console.log('Backend connection successful');
      this.loadAllData();
    } catch (error: any) {
      console.error('Backend connection failed:', error);
      this.message = 'Error de conexión con el servidor. Verifica que el backend esté corriendo en http://localhost:8080';
      this.messageType = 'error';
      this.isInitialLoading = false;
    }
  }

  async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadSpices(),
        this.loadMeasures(),
        this.loadColors(),
        this.loadProducts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await this.productService.getCategories();
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  }

  async loadSpices(): Promise<void> {
    try {
      this.spices = await this.productService.getSpices();
    } catch (error: any) {
      console.error('Error loading spices:', error);
    }
  }

  async loadMeasures(): Promise<void> {
    try {
      this.measures = await this.productService.getMeasures();
    } catch (error: any) {
      console.error('Error loading measures:', error);
    }
  }

  async loadColors(): Promise<void> {
    try {
      this.colors = await this.productService.getColors();
    } catch (error: any) {
      console.error('Error loading colors:', error);
    }
  }

  async loadProducts(): Promise<void> {
    try {
      this.products = await this.productService.getAllProducts().toPromise() || [];
      this.filteredProducts = [...this.products];
    } catch (error: any) {
      console.error('Error loading products:', error);
    } finally {
      this.isInitialLoading = false;
    }
  }

  // Métodos del wizard
  selectExistingProduct(): void {
    this.showProductModal = true;
    this.isNewProduct = false;
    this.filteredProducts = [...this.products];
  }

  createNewProduct(): void {
    this.showProductModal = false;
    this.isNewProduct = true;
    this.selectedProduct = null;
  }

  cancelNewProduct(): void {
    this.isNewProduct = false;
    this.selectedProduct = null;
    this.productForm.reset();
  }

  onProductSelected(product: Product): void {
    this.selectedProduct = product;
    this.showProductModal = false;
    this.isNewProduct = false;
    this.nextStep();
  }

  filterProducts(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  }

  async createProductAndContinue(): Promise<void> {
    if (this.productForm.invalid) return;

    this.isLoading = true;
    this.message = '';

    try {
      const productData: any = {
        product: this.productForm.get('productName')?.value
      };

      if (this.productForm.get('category')?.value) {
        productData.category = { id: this.productForm.get('category')?.value };
      }

      const createdProduct = await this.productService.createProductAsync(productData);
      this.selectedProduct = createdProduct;
      this.isNewProduct = true;
      this.nextStep();
    } catch (error: any) {
      console.error('Error creating product:', error);
      this.message = error.error?.message || 'Error al crear el producto';
      this.messageType = 'error';
      this.errorFilter.handle(error);
    } finally {
      this.isLoading = false;
    }
  }

  nextStep(): void {
    if (this.selectedProduct) {
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    this.currentStep = 1;
    this.selectedProduct = null;
    this.isNewProduct = false;
  }

  async createVariation(): Promise<void> {
    if (this.variationForm.invalid || !this.selectedProduct) return;

    this.isLoading = true;
    this.message = '';

    try {
      const variationData: any = {
        product: { id: this.selectedProduct.id },
        price: this.variationForm.get('price')?.value,
        stock: this.variationForm.get('stock')?.value
      };

      if (this.variationForm.get('spice')?.value) {
        variationData.spice = { id: this.variationForm.get('spice')?.value };
      }

      if (this.variationForm.get('measure')?.value) {
        variationData.measure = { id: this.variationForm.get('measure')?.value };
      }

      if (this.variationForm.get('color')?.value) {
        variationData.color = { id: this.variationForm.get('color')?.value };
      }

      if (this.variationForm.get('image')?.value) {
        variationData.image = this.variationForm.get('image')?.value;
      }

      if (this.variationForm.get('description')?.value) {
        variationData.description = this.variationForm.get('description')?.value;
      }

      await this.productService.createVariationAsync(variationData);

      this.message = 'Variación creada exitosamente';
      this.messageType = 'success';

      setTimeout(() => {
        this.router.navigate(['/products']);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating variation:', error);
      this.message = error.error?.message || 'Error al crear la variación';
      this.messageType = 'error';
      this.errorFilter.handle(error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  onImageInput(event: any): void {
    // Este método se ejecuta cada vez que el usuario escribe en el campo de imagen
    // La validación ya está manejada por el FormControl
  }

  getImageLength(): number {
    const imageValue = this.variationForm.get('image')?.value;
    return imageValue ? imageValue.length : 0;
  }

  onDescriptionInput(event: any): void {
    // Este método se ejecuta cada vez que el usuario escribe en el campo de descripción
    // La validación ya está manejada por el FormControl
  }

  getDescriptionLength(): number {
    const descriptionValue = this.variationForm.get('description')?.value;
    return descriptionValue ? descriptionValue.length : 0;
  }
}
