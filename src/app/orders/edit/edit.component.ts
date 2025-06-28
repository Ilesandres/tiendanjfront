import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { OrderService } from "../../services/order.service";
import { ProductService } from "../../services/product.service";
import { Order, ProductOrder } from "../../interfaces/order.interface";
import { Product, ProductVariation } from "../../interfaces/product.interface";
import { ErrorFiltersService } from "../../interceptors/error.filters";

@Component({
  selector: "app-edit-order",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.css"]
})
export class EditOrderComponent implements OnInit {
  orderId!: number;
  order!: Order;
  loading = true;
  error: string | null = null;

  paymentForm!: FormGroup;
  products: ProductOrder[] = [];
  allProducts: Product[] = [];
  allVariations: ProductVariation[] = [];
  selectedProductVariations: ProductVariation[] = [];
  addProductForm!: FormGroup;

  // Verificar si la orden se puede editar
  canEdit = true;

  paymentMethods = [
    { id: 1, method: "efectivo" },
    { id: 2, method: "tarjeta" },
    { id: 3, method: "transferencia" }
  ];
  paymentStatuses = [
    { id: 1, status: "pendiente" },
    { id: 2, status: "pagado" },
    { id: 3, status: "rechazado" }
  ];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private errorFilter: ErrorFiltersService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get("id"));
    this.loadOrder();
    this.loadAllProducts();
    this.loadAllVariations();
    
    this.paymentForm = this.fb.group({
      method: [null, Validators.required],
      status: [null, Validators.required]
    });
    
    this.addProductForm = this.fb.group({
      productId: [null, Validators.required],
      variationId: [null, Validators.required],
      amount: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadOrder(): void {
    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order: Order) => {
        this.order = order;
        this.products = order.productOrder || [];
        this.canEdit = order.payment?.status?.status !== 'pagado';
        
        // Update form values and disabled state
        this.paymentForm.patchValue({
          method: order.payment?.method?.id || null,
          status: order.payment?.status?.id || null
        });
        
        // Manage disabled state through form controls
        if (!this.canEdit) {
          this.paymentForm.disable();
        } else {
          this.paymentForm.enable();
        }
        
        this.loading = false;
      },
      error: (err: any) => {
        this.error = "No se pudo cargar la orden.";
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  loadAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
      }
    });
  }

  loadAllVariations(): void {
    this.productService.getAllVariations().subscribe({
      next: (variations) => {
        this.allVariations = variations;
      }
    });
  }

  // Métodos de pago
  updatePayment(): void {
    if (this.paymentForm.invalid || !this.canEdit) return;
    const { method, status } = this.paymentForm.value;
    this.orderService.updatePayment(this.order.payment!.id, { method: { id: method }, status: { id: status } })
      .subscribe({
        next: () => {
          this.loadOrder();
          // Si el estado cambió a pagado, actualizar canEdit
          if (status === 2) {
            this.canEdit = false;
          }
        },
        error: () => this.error = "No se pudo actualizar el pago."
      });
  }

  // Productos (variaciones)
  addProduct(): void {
    if (this.addProductForm.invalid || !this.canEdit) return;
    const { variationId, amount } = this.addProductForm.value;
    this.orderService.addProductToOrder(this.orderId, variationId, amount).subscribe({
      next: () => this.loadOrder(),
      error: (err: any) => {
        console.log(err)
        this.error = err.error.message || "No se pudo agregar el producto."
    }
    });
  }

  updateProductAmount(productOrder: ProductOrder, newAmount: number): void {
    if (newAmount < 1 || !this.canEdit) return;
    this.orderService.updateProductOrder(productOrder.id, this.orderId, productOrder.product.id, newAmount).subscribe({
      next: () => this.loadOrder(),
      error: () => this.error = "No se pudo actualizar la cantidad."
    });
  }

  deleteProduct(productOrder: ProductOrder): void {
    if (!this.canEdit) return;
    this.orderService.deleteProductFromOrder(productOrder.id).subscribe({
      next: () => this.loadOrder(),
      error: () => this.error = "No se pudo eliminar el producto."
    });
  }

  // Obtener variaciones de un producto específico
  getVariationsForProduct(productId: number): ProductVariation[] {
    return this.allVariations.filter(v => v.product.id === productId && v.active);
  }

  // Obtener información completa de la variación
  getVariationInfo(variationId: number): ProductVariation | null {
    return this.allVariations.find(v => v.id === variationId) || null;
  }

  // Manejar cambio de producto seleccionado
  onProductChange(event: any): void {
    const productId = event.target.value;
    if (productId) {
      this.selectedProductVariations = this.getVariationsForProduct(Number(productId));
      this.addProductForm.patchValue({ variationId: null });
    } else {
      this.selectedProductVariations = [];
      this.addProductForm.patchValue({ variationId: null });
    }
  }

  goBack(): void {
    this.router.navigate(["/orders", this.orderId]);
  }

  goToList(): void {
    this.router.navigate(["/orders"]);
  }
}
