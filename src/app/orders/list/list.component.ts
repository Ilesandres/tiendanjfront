import { Component, ErrorHandler, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../interfaces/order.interface';
import { UserService } from '../../services/user.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  // Estadísticas
  totalSales = 0;
  completedOrders = 0;
  pendingOrders = 0;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    public router: Router,
    private errorFilter:ErrorFiltersService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.calculateStats();
        this.loading = false;
        console.log(this.orders);
      },
      error: (err) => {
        this.error = 'Error al cargar las ventas';
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  calculateStats(): void {
    this.totalSales = this.orders.reduce((sum, order) => Number(sum) + Number(order.total || 0), 0);
    
    this.completedOrders = this.orders.filter(order => 
      order.payment?.status?.status?.toLowerCase().includes('completado') ||
      order.payment?.status?.status?.toLowerCase().includes('pagado')
    ).length;
    
    this.pendingOrders = this.orders.filter(order => 
      order.payment?.status?.status?.toLowerCase().includes('pendiente') ||
      !order.payment?.status?.status
    ).length;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completado') || statusLower.includes('pagado')) {
      return 'status-completed';
    } else if (statusLower.includes('pendiente')) {
      return 'status-pending';
    } else if (statusLower.includes('cancelado')) {
      return 'status-cancelled';
    } else {
      return 'status-pending';
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

  viewOrder(id: number): void {
    this.router.navigate(['/orders', id]);
  }

  editOrder(id: number): void {
    // TODO: Implementar edición de orden
    console.log('Editar orden:', id);
  }

  createNewOrder(): void {
    // TODO: Implementar creación de nueva orden
    console.log('Crear nueva orden');
  }
}
