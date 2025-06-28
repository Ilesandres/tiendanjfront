import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class DetailComponent implements OnInit {
  order: any = null;
  loading = false;
  error: string | null = null;
  sendingInvoice = false;
  invoiceSent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private errorFilter: ErrorFiltersService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(parseInt(id));
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(id).subscribe({
      next: (order: any) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la orden';
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  // Check if order is paid
  isOrderPaid(): boolean {
    return this.order?.payment?.status?.status?.toLowerCase() === 'pagado';
  }

  // Check if customer has email
  hasCustomerEmail(): boolean {
    return this.order?.user?.people?.email && this.order.user.people.email.trim() !== '';
  }

  // Send invoice email
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
        // Reset success message after 5 seconds
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

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
