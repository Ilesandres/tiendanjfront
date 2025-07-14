import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ShipmentService, Shipment } from '../../services/shipment.service';
import { StatusShipmentService, StatusShipment } from '../../services/statusshipment.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';
import { ProductService } from '../../services/product.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DetailComponent implements OnInit {
  order: any = null;
  loading = false;
  error: string | null = null;
  sendingInvoice = false;
  invoiceSent = false;
  private authSubscription: Subscription | null = null;


  shipmentStatuses: StatusShipment[] = [];
  editingShipment = false;
  shipmentForm = {
    statusId: 0,
    details: ''
  };
  savingShipment = false;


  availableProducts: any[] = [];
  filteredProducts: any[] = [];
  productInput = '';
  showProductDropdown = false;
  productInputRef: any;
  addingProduct = false;
  addingProductLoading = false;
  productForm = {
    productId: 0,
    amount: 1
  };
  editingProduct: any = null;
  editingProductForm = {
    amount: 1
  };
  deletingProduct = false;


  addingVoucher = false;
  addingVoucherLoading = false;
  voucherForm = {
    value: 0
  };
  editingVoucher: any = null;
  editingVoucherForm = {
    value: 0
  };
  deletingVoucher = false;
  voucherRestante = 0;


  paymentStatuses: any[] = [];
  selectedPaymentStatusId: number | null = null;
  updatingPaymentStatus = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private shipmentService: ShipmentService,
    private statusShipmentService: StatusShipmentService,
    private errorFilter: ErrorFiltersService,
    private productService: ProductService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(parseInt(id));
      this.loadShipmentStatuses();
      this.loadAvailableProducts();
      this.loadPaymentStatuses(); // cargar estados de pago
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(id).subscribe({
      next: (order: any) => {
        this.order = order;
        this.updateVoucherRestante();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la orden';
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  updateVoucherRestante(): void {
    if (!this.order || !this.order.payment) {
      this.voucherRestante = 0;
      return;
    }
    const total = Number(this.order.total) || 0;
    const vouchers: any[] = Array.isArray(this.order.payment.vouchers) ? this.order.payment.vouchers : [];
    const abonado = vouchers.reduce((sum: number, v: any) => sum + Number(v.value || 0), 0);
    this.voucherRestante = Math.max(total - abonado, 0);
  }

  loadShipmentStatuses(): void {
    this.statusShipmentService.getAllStatuses().subscribe({
      next: (statuses) => {
        this.shipmentStatuses = statuses;
      },
      error: (err) => {
        console.error('Error loading shipment statuses:', err);
      }
    });
  }

  loadAvailableProducts(): void {
    this.productService.getAllVariations().subscribe({
      next: (products) => {
        this.availableProducts = products.filter(p => p.active && p.product?.active);
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }


  loadPaymentStatuses(): void {
    this.orderService.getAllPaymentStatus().subscribe({
      next: (statuses) => {
        this.paymentStatuses = statuses;
      },
      error: (err) => {
        console.error('Error loading payment statuses:', err);
      }
    });
  }


  updatePaymentStatusDirect(): void {
    if (!this.selectedPaymentStatusId || !this.order?.payment?.id) return;
    this.updatingPaymentStatus = true;
    this.error = null;
    this.orderService.updatePayment(this.order.payment.id, {
      method: { id: this.order.payment.method.id },
      status: { id: this.selectedPaymentStatusId }
    }).subscribe({
      next: () => {
        this.loadOrder(this.order.id);
        this.updatingPaymentStatus = false;
      },
      error: (err) => {
        this.error = 'Error al actualizar el estado del pago';
        this.updatingPaymentStatus = false;
        this.errorFilter.handle(err);
      }
    });
  }


  isOrderPending(): boolean {
    return this.order?.payment?.status?.status?.toLowerCase() === 'pendiente';
  }


  isOrderPaid(): boolean {
    return this.order?.payment?.status?.status?.toLowerCase() === 'pagado';
  }


  hasCustomerEmail(): boolean {
    return this.order?.user?.people?.email && this.order.user.people.email.trim() !== '';
  }


  sendInvoice(): void {
    if (!this.isOrderPaid()) {
      this.error = 'No se puede enviar la factura. La orden debe estar pagada.';
      return;
    }

    if (!this.hasCustomerEmail()) {
      this.error = 'No se puede enviar la factura. El cliente no tiene email registrado.';
      return;
    }

    this.sendingInvoice = true;
    this.error = null;

    this.orderService.sendInvoiceEmail(this.order.id).subscribe({
      next: (response) => {
        this.sendingInvoice = false;
        this.invoiceSent = true;

        setTimeout(() => {
          this.invoiceSent = false;
        }, 5000);
      },
      error: (err) => {
        this.sendingInvoice = false;
        this.error = 'Error al enviar la factura por email';
        this.errorFilter.handle(err);
      }
    });
  }
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }


  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return typeof userRole === 'string' && userRole.trim().toLowerCase() === 'admin';
  }


  startAddingProduct(): void {
    this.addingProduct = true;
    this.productForm = {
      productId: 0,
      amount: 1
    };
    this.productInput = '';
    this.filteredProducts = [...this.availableProducts];
    this.showProductDropdown = false;
    setTimeout(() => {
      if (this.productInputRef) {
        this.productInputRef.focus();
      }
    }, 0);
  }

  onProductInputFocus(): void {
    this.showProductDropdown = true;
    this.filteredProducts = this.filterProducts(this.productInput);
  }

  onProductInputBlur(): void {
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 150); // Espera para permitir click en la lista
  }

  onProductInputChange(): void {
    this.filteredProducts = this.filterProducts(this.productInput);
    this.showProductDropdown = true;
  }

  filterProducts(query: string): any[] {
    if (!query || query.trim() === '') {
      return [...this.availableProducts];
    }
    const q = query.trim().toLowerCase();
    return this.availableProducts.filter(p =>
      (p.product?.product || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }

  selectProduct(product: any): void {
    this.productForm.productId = product.id;
    this.productInput = `${product.product?.product || ''}${product.description ? ' - ' + product.description : ''}`;
    this.showProductDropdown = false;
  }

  clearProductInput(): void {
    this.productInput = '';
    this.productForm.productId = 0;
    this.filteredProducts = [...this.availableProducts];
    this.showProductDropdown = true;
    if (this.productInputRef) {
      this.productInputRef.focus();
    }
  }

  cancelAddingProduct(): void {
    this.addingProduct = false;
    this.productForm = {
      productId: 0,
      amount: 1
    };
  }

  addProduct(): void {
    if (!this.productForm.productId || this.productForm.amount < 1) {
      this.error = 'Debe seleccionar un producto y especificar una cantidad válida';
      return;
    }
    this.addingProductLoading = true;
    this.error = null;
    this.orderService.addProductToOrder(this.order.id, this.productForm.productId, this.productForm.amount).subscribe({
      next: () => {
        this.loadOrder(this.order.id);
        this.cancelAddingProduct();
        this.addingProductLoading = false;
      },
      error: (err) => {
        this.error = 'Error al agregar el producto';
        this.errorFilter.handle(err);
        this.addingProductLoading = false;
      }
    });
  }

  startEditingProduct(productOrder: any): void {
    this.editingProduct = productOrder;
    this.editingProductForm.amount = productOrder.amount;
  }

  cancelEditingProduct(): void {
    this.editingProduct = null;
    this.editingProductForm.amount = 1;
  }

  updateProduct(): void {
    if (!this.editingProduct || this.editingProductForm.amount < 1) {
      this.error = 'Cantidad inválida';
      return;
    }

    this.orderService.updateProductOrder(
      this.editingProduct.id, 
      this.order.id, 
      this.editingProduct.product.id, 
      this.editingProductForm.amount
    ).subscribe({
      next: () => {
        this.loadOrder(this.order.id);
        this.cancelEditingProduct();
      },
      error: (err) => {
        this.error = 'Error al actualizar el producto';
        this.errorFilter.handle(err);
      }
    });
  }

  deleteProduct(productOrder: any): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto de la orden?')) {
      return;
    }

    this.deletingProduct = true;
    this.error = null;

    this.orderService.deleteProductFromOrder(productOrder.id).subscribe({
      next: () => {
        this.deletingProduct = false;
        this.loadOrder(this.order.id);
      },
      error: (err) => {
        this.deletingProduct = false;
        this.error = 'Error al eliminar el producto';
        this.errorFilter.handle(err);
      }
    });
  }


  startAddingVoucher(): void {
    this.addingVoucher = true;
    this.voucherForm.value = 0;
  }

  cancelAddingVoucher(): void {
    this.addingVoucher = false;
    this.voucherForm.value = 0;
  }

  addVoucher(): void {
    if (!this.voucherForm.value || this.voucherForm.value <= 0) {
      this.error = 'Debe especificar un valor válido para el voucher';
      return;
    }
    if (this.voucherForm.value > this.voucherRestante) {
      this.error = 'El valor del abono no puede ser mayor a lo que falta para completar el pago.';
      return;
    }
    this.addingVoucherLoading = true;
    this.error = null;
    const voucherData = {
      payment: {
        id: this.order.payment.id
      },
      value: this.voucherForm.value
    };
    this.orderService.createVoucher(voucherData).subscribe({
      next: () => {
        this.loadOrder(this.order.id);
        this.cancelAddingVoucher();
        this.addingVoucherLoading = false;
      },
      error: (err) => {
        this.error = 'Error al crear el voucher';
        this.errorFilter.handle(err);
        this.addingVoucherLoading = false;
      }
    });
  }

  startEditingVoucher(voucher: any): void {
    this.editingVoucher = voucher;
    this.editingVoucherForm.value = voucher.value;
  }

  cancelEditingVoucher(): void {
    this.editingVoucher = null;
    this.editingVoucherForm.value = 0;
  }

  updateVoucher(): void {
    if (!this.editingVoucher || this.editingVoucherForm.value <= 0) {
      this.error = 'Debe especificar un valor válido para el voucher';
      return;
    }

    const total = Number(this.order.total) || 0;
    const vouchers: any[] = Array.isArray(this.order.payment.vouchers) ? this.order.payment.vouchers : [];
    const abonadoSinActual = vouchers.filter((v: any) => v.id !== this.editingVoucher.id).reduce((sum: number, v: any) => sum + Number(v.value || 0), 0);
    const restante = Math.max(total - abonadoSinActual, 0);
    if (this.editingVoucherForm.value > restante) {
      this.error = 'El valor del abono no puede ser mayor a lo que falta para completar el pago.';
      return;
    }
    const voucherData = {
      payment: {
        id: this.order.payment.id
      },
      value: this.editingVoucherForm.value
    };
    this.orderService.updateVoucher(this.editingVoucher.id, voucherData).subscribe({
      next: () => {
        this.loadOrder(this.order.id);
        this.cancelEditingVoucher();
      },
      error: (err) => {
        this.error = 'Error al actualizar el voucher';
        this.errorFilter.handle(err);
      }
    });
  }

  deleteVoucher(voucher: any): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este voucher?')) {
      return;
    }

    this.deletingVoucher = true;
    this.error = null;

    this.orderService.deleteVoucher(voucher.id).subscribe({
      next: () => {
        this.deletingVoucher = false;
        this.loadOrder(this.order.id);
      },
      error: (err) => {
        this.deletingVoucher = false;
        this.error = 'Error al eliminar el voucher';
        this.errorFilter.handle(err);
      }
    });
  }


  startEditingShipment(): void {
    this.editingShipment = true;
    if (this.order.shipment) {
      this.shipmentForm.statusId = this.order.shipment.status.id;
      this.shipmentForm.details = this.order.shipment.details || '';
    } else {
      this.shipmentForm.statusId = 0;
      this.shipmentForm.details = '';
    }
  }

  cancelEditingShipment(): void {
    this.editingShipment = false;
    this.shipmentForm = {
      statusId: 0,
      details: ''
    };
  }

  saveShipment(): void {
    if (!this.shipmentForm.statusId) {
      this.error = 'Debe seleccionar un estado de envío';
      return;
    }

    this.savingShipment = true;
    this.error = null;

    const shipmentData = {
      order: {
        id: this.order.id
      },
      status: {
        id: this.shipmentForm.statusId
      },
      details: this.shipmentForm.details
    };

    if (this.order.shipment) {

      this.shipmentService.updateShipment(this.order.shipment.id, shipmentData).subscribe({
        next: (updatedShipment) => {
          this.order.shipment = updatedShipment;
          this.editingShipment = false;
          this.savingShipment = false;
        },
        error: (err) => {
          this.error = 'Error al actualizar el envío';
          this.savingShipment = false;
          this.errorFilter.handle(err);
        }
      });
    } else {

      this.shipmentService.createShipment(shipmentData).subscribe({
        next: (newShipment) => {
          this.order.shipment = newShipment;
          this.editingShipment = false;
          this.savingShipment = false;
        },
        error: (err) => {
          this.error = 'Error al crear el envío';
          this.savingShipment = false;
          this.errorFilter.handle(err);
        }
      });
    }
  }

  deleteShipment(): void {
    if (!this.order.shipment) return;

    if (confirm('¿Estás seguro de que quieres eliminar este envío?')) {
      this.shipmentService.deleteShipment(this.order.shipment.id).subscribe({
        next: () => {
          this.order.shipment = null;
          this.error = null;
        },
        error: (err) => {
          this.error = 'Error al eliminar el envío';
          this.errorFilter.handle(err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
