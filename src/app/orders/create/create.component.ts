import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { UserService, User } from '../../services/user.service';
import { Order, PaymentMethod, PaymentStatus, TypeOrder } from '../../interfaces/order.interface';
import { Product } from '../../interfaces/product.interface';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class CreateComponent implements OnInit {
  orderForm: FormGroup;
  userSearchForm: FormGroup;
  productSearchForm: FormGroup;
  
  // Data
  paymentMethods: PaymentMethod[] = [];
  paymentStatuses: PaymentStatus[] = [];
  typeOrders: TypeOrder[] = [];
  allProducts: Product[] = [];
  products: Product[] = [];
  selectedUser: User | null = null;
  cartItems: CartItem[] = [];
  
  // UI States
  loading = false;
  searchingUser = false;
  searchingProducts = false;
  userNotFound = false;
  showUserForm = false;
  
  // Totals
  subtotal = 0;
  total = 0;

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
      searchTerm: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPaymentMethods();
    this.loadPaymentStatuses();
    this.loadTypeOrders();
    this.loadProducts();
    this.userService.getUserInfo();
  }

  // Load Data Methods
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
        // Adaptar la estructura para que cada producto tenga variationProducts
        const adapted = products.map(prod => ({
          ...prod,
          variationProducts: prod.variation || []
        }));
        this.allProducts = adapted;
        this.products = adapted;
        console.log('Products loaded:', adapted);
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
      }
    });
  }

  // User Search Methods
  searchUser(): void {
    if (this.userSearchForm.valid) {
      this.searchingUser = true;
      this.userNotFound = false;
      const dni = this.userSearchForm.get('dni')?.value;

      this.userService.searchUserByDni(dni).subscribe({
        next: (user: User) => {
          // Usuario encontrado
          this.selectedUser = user;
          this.searchingUser = false;
          console.log('User found:', this.selectedUser);
        },
        error: (err: any) => {
          // Usuario no encontrado, mostrar formulario para crear
          this.userNotFound = true;
          this.showUserForm = true;
          this.searchingUser = false;
          console.log('User not found, showing create form');
        }
      });
    }
  }

  createUser(): void {
    // Aquí implementarías la creación del usuario
    // Por ahora solo simulamos
    this.showUserForm = false;
    this.userNotFound = false;
    // TODO: Implementar creación de usuario
  }

  // Product Search Methods
  searchProducts(): void {
    if (this.productSearchForm.valid) {
      this.searchingProducts = true;
      const searchTerm = this.productSearchForm.get('searchTerm')?.value;
      
      // Filtrar productos por nombre sobre allProducts
      const filteredProducts = this.allProducts.filter(product => 
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      this.products = filteredProducts;
      this.searchingProducts = false;
    }
  }

  // Cart Methods
  addToCart(product: Product, variation: any, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => 
      item.product.id === product.id && item.variation.id === variation.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
      const cartItem: CartItem = {
        product,
        variation,
        quantity,
        price: variation.price,
        subtotal: variation.price * quantity
      };
      this.cartItems.push(cartItem);
    }

    this.calculateTotals();
    console.log('Product added to cart:', product.product, variation.spice.spice, quantity);
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.calculateTotals();
  }

  updateQuantity(index: number, quantity: string): void {
    const qty = parseInt(quantity);
    if (qty > 0) {
      this.cartItems[index].quantity = qty;
      this.cartItems[index].subtotal = qty * this.cartItems[index].price;
      this.calculateTotals();
    }
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.total = this.subtotal; // Aquí podrías agregar impuestos, descuentos, etc.
  }

  // Order Creation - FLUJO CORREGIDO
  createOrder(): void {
    if (this.orderForm.valid && this.selectedUser && this.cartItems.length > 0) {
      this.loading = true;
      console.log('Starting order creation process...');

      // Paso 1: Crear la orden sin productos
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
          
          // Paso 2: Agregar productos a la orden
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
        product: { id: item.variation.id }, // Usar el ID de la variación, no del producto principal
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
    
    // Actualizar el total de la orden
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

  // Utility Methods
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