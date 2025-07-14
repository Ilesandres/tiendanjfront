import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { UserService, User } from '../../services/user.service';
import { Order, PaymentMethod, PaymentStatus, TypeOrder } from '../../interfaces/order.interface';
import { Product } from '../../interfaces/product.interface';
import Swal from 'sweetalert2';

interface CartItem {
  product: Product;
  variation: any;
  quantity: number;
  price: number;
  subtotal: number;
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
  standalone: true,
  imports: [
    CommonModule,
     FormsModule, 
     ReactiveFormsModule,
    ],
    providers:[
      
    ]
})
export class CreateComponent implements OnInit {
  orderForm: FormGroup;
  userSearchForm: FormGroup;
  productSearchForm: FormGroup;
  

  paymentMethods: PaymentMethod[] = [];
  paymentStatuses: PaymentStatus[] = [];
  typeOrders: TypeOrder[] = [];
  allProducts: Product[] = [];
  products: Product[] = [];
  selectedUser: User | null = null;
  cartItems: CartItem[] = [];
  

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25];
  

  Math = Math;
  

  loading = false;
  searchingUser = false;
  searchingProducts = false;
  userNotFound = false;
  showUserForm = false;
  

  subtotal = 0;
  total = 0;


  showStockDialog = false;
  stockDialogMessage = '';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService,
    private router: Router
    
  ) {
    this.orderForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      typeOrder: ['', Validators.required],
    });

    this.userSearchForm = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]]
    });

    this.productSearchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadPaymentMethods();
    this.loadPaymentStatuses();
    this.loadTypeOrders();
    this.loadProducts();
    this.userService.getUserInfo();


    this.productSearchForm.get('searchTerm')?.valueChanges.subscribe((searchTerm: string) => {
      if (!searchTerm || searchTerm.trim() === '') {
        this.products = this.allProducts;
        this.updatePagination();
        return;
      }
      this.products = this.allProducts.filter(product =>
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.updatePagination();
    });
  }


  loadPaymentMethods(): void {
    this.orderService.getAllPaymentMethods().subscribe({
      next: (methods: PaymentMethod[]) => {
        this.paymentMethods = methods;
        console.log('Payment methods loaded:', methods);
      },
      error: (err: any) => {
        console.error('Error loading payment methods:', err);
      }
    });
  }

  loadPaymentStatuses(): void {
    this.orderService.getAllPaymentStatus().subscribe({
      next: (statuses: PaymentStatus[]) => {
        this.paymentStatuses = statuses;
        console.log('Payment statuses loaded:', statuses);
      },
      error: (err: any) => {
        console.error('Error loading payment statuses:', err);
      }
    });
  }

  loadTypeOrders(): void {
    this.orderService.getAllTypeOrders().subscribe({
      next: (types: TypeOrder[]) => {
        this.typeOrders = types;
        console.log('Type orders loaded:', types);
      },
      error: (err: any) => {
        console.error('Error loading type orders:', err);
      }
    });
  }

  loadProducts(): void {
    console.log('Loading products...');
    this.productService.getAllProducts().subscribe({
      next: (products: any[]) => {
        console.log(products)
        const adapted = products.map(prod => ({
          ...prod,
          variationProducts: prod.variation || []
        }));
        this.allProducts = adapted;
        this.products = adapted;
        this.updatePagination();
        console.log('Products loaded:', adapted);
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
      }
    });
  }

  updatePagination(): void {
    this.totalItems = this.products.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when data changes
  }

  getPaginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.products.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; 
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  searchUser(): void {
    if (this.userSearchForm.valid) {
      this.searchingUser = true;
      this.userNotFound = false;
      const dni = this.userSearchForm.get('dni')?.value;

      this.userService.searchUserByDni(dni).subscribe({
        next: (user: User) => {
          this.selectedUser = user;
          this.searchingUser = false;
          console.log('User found:', this.selectedUser);
        },
        error: (err: any) => {
          this.userNotFound = true;
          this.showUserForm = true;
          this.searchingUser = false;
          console.log('User not found, showing create form');
        }
      });
    }
  }

  createUser(): void {
    this.showUserForm = false;
    this.userNotFound = false;
  }

  searchProducts(): void {
    if (this.productSearchForm.valid) {
      this.searchingProducts = true;
      const searchTerm = this.productSearchForm.get('searchTerm')?.value;
      if (!searchTerm || searchTerm.trim() === '') {
        this.products = this.allProducts;
        this.updatePagination();
        this.searchingProducts = false;
        return;
      }
      const filteredProducts = this.allProducts.filter(product => 
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.products = filteredProducts;
      this.updatePagination();
      this.searchingProducts = false;
    }
  }

  clearProductFilter(): void {
    this.productSearchForm.get('searchTerm')?.setValue('');
    this.products = this.allProducts;
    this.updatePagination();
  }

  addToCart(product: Product, variation: any, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => 
      item.product.id === product.id && item.variation.id === variation.id
    );

    if (existingItem) {
      console.log('variation.stock', variation.stock);
      if (variation.stock - quantity < 0) {
        console.log('No hay suficiente stock disponible para agregar más de este producto.');
        this.openStockDialog('No hay suficiente stock disponible para agregar más de este producto.');
        return;
      }
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
      if (variation.stock < quantity) {
        console.log('No hay suficiente stock disponible para agregar este producto 1212.');
        this.openStockDialog('No hay suficiente stock disponible para agregar este producto.');
        return;
      }
      const cartItem: CartItem = {
        product,
        variation,
        quantity,
        price: variation.price,
        subtotal: variation.price * quantity
      };
      this.cartItems.push(cartItem);
    }

    variation.stock -= quantity;
    this.calculateTotals();
    console.log('Product added to cart:', product.product, variation.spice.spice, quantity);
  }

  openStockDialog(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Sin stock',
      text: message,
      confirmButtonColor: '#d32f2f',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }

  removeFromCart(index: number): void {
    const item = this.cartItems[index];
    item.variation.stock += item.quantity;
    this.cartItems.splice(index, 1);
    this.calculateTotals();
  }

  updateQuantity(index: number, quantity: string): void {
    const qty = parseInt(quantity);
    if (qty > 0) {
      const item = this.cartItems[index];
      const diff = qty - item.quantity;
      if (item.variation.stock - diff < 0) {
        this.openStockDialog('No hay suficiente stock disponible para esta cantidad.');
        return;
      }
      item.variation.stock -= diff;
      item.quantity = qty;
      item.subtotal = qty * item.price;
      this.calculateTotals();
    }
  }

  onQuantityInputChange(input: HTMLInputElement, variation: any): void {
    const value = parseInt(input.value, 10);
    if (isNaN(value) || value < 1) {
      input.value = '1';
      return;
    }
    if (value > variation.stock) {
      input.value = variation.stock > 0 ? variation.stock.toString() : '1';
      this.openStockDialog('No hay suficiente stock disponible para esa cantidad.');
    }
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.total = this.subtotal; 
  }

  createOrder(): void {
    if (this.orderForm.valid && this.selectedUser && this.cartItems.length > 0) {
      this.loading = true;
      console.log('Starting order creation process...');

      const orderData = {
        user: { id: this.selectedUser?.id },
        payment: {
          method: { id: this.orderForm.get('paymentMethod')?.value },
          status: { id: this.orderForm.get('paymentStatus')?.value }
        },
        typeOrder: { id: this.orderForm.get('typeOrder')?.value }
      };

      console.log('Creating order with data:', orderData);

      this.orderService.createOrder(orderData).subscribe({
        next: (order: Order) => {
          console.log('Order created successfully:', order);
          
          this.addProductsToOrder(order.id);
        },
        error: (err: any) => {
          console.error('Error creating order:', err);
          this.loading = false;
        }
      });
    }
  }

  addProductsToOrder(orderId: number): void {
    console.log('Adding products to order:', orderId);
    let productsAdded = 0;
    let productsFailed = 0;
    const totalProducts = this.cartItems.length;

    if (totalProducts === 0) {
      this.loading = false;
      this.router.navigate(['/orders']);
      return;
    }

    this.cartItems.forEach((item, index) => {
      const productOrderData = {
        order: { id: orderId },
        product: { id: item.variation.id }, 
        amount: item.quantity
      };

      console.log(`Adding product ${index + 1}/${totalProducts}:`, productOrderData);

      this.orderService.addProductToOrder(orderId, item.variation.id, item.quantity).subscribe({
        next: (response) => {
          productsAdded++;
          console.log(`Product ${index + 1} added successfully:`, response);
          
          if (productsAdded + productsFailed === totalProducts) {
            this.finalizeOrder(orderId);
          }
        },
        error: (err: any) => {
          productsFailed++;
          console.error(`Error adding product ${index + 1}:`, err);
          
          if (productsAdded + productsFailed === totalProducts) {
            this.finalizeOrder(orderId);
          }
        }
      });
    });
  }

  finalizeOrder(orderId: number): void {
    console.log('Finalizing order:', orderId);
    
    this.orderService.updateOrderTotal(orderId, { total: this.total }).subscribe({
      next: (response) => {
        console.log('Order total updated:', response);
        this.loading = false;
        this.router.navigate(['/orders']);
      },
      error: (err: any) => {
        console.error('Error updating order total:', err);
        this.loading = false;
        this.router.navigate(['/orders']);
      }
    });
  }

  canCreateOrder(): boolean {
    return this.orderForm.valid && 
           this.selectedUser !== null && 
           this.cartItems.length > 0 && 
           !this.loading;
  }

  getProductImage(product: Product): string {
    if (!product.image || product.image.trim() === '') {
      return 'https://placehold.co/400x200?text=Producto';
    }
    return product.image;
  }

  onImageError(event: any): void {
    event.target.src = 'https://placehold.co/400x200?text=Producto';
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
} 
