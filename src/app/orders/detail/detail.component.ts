import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ShipmentService, Shipment } from '../../services/shipment.service';
import { StatusShipmentService, StatusShipment } from '../../services/statusshipment.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';

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

  // Shipment management
  shipmentStatuses: StatusShipment[] = [];
  editingShipment = false;
  shipmentForm = {
    statusId: 0,
    details: ''
  };
  savingShipment = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private shipmentService: ShipmentService,
    private statusShipmentService: StatusShipmentService,
    private errorFilter: ErrorFiltersService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(parseInt(id));
      this.loadShipmentStatuses();
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

  // Shipment management methods
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
      // Update existing shipment
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
      // Create new shipment
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
