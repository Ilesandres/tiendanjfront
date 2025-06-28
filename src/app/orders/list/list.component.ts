import { Component, ErrorHandler, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderFilters } from '../../interfaces/order.interface';
import { UserService } from '../../services/user.service';
import { ErrorFiltersService } from '../../interceptors/error.filters';
import { OrderFiltersComponent } from '../filters/order-filters.component';
import { OrderStatsComponent } from '../stats/order-stats.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, OrderFiltersComponent, OrderStatsComponent]
})
export class ListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  error: string | null = null;
  currentFilters: OrderFilters = {};
  searchTerm: string = '';

  // Estadísticas
  totalSales = 0;
  completedOrders = 0;
  pendingOrders = 0;

  // Paginación
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;

  // Hacer Math disponible en el template
  Math = Math;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    public router: Router,
    private errorFilter: ErrorFiltersService
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
        this.filteredOrders = orders;
        this.totalItems = orders.length;
        this.loading = false;
        console.log('Órdenes cargadas:', this.orders);
      },
      error: (err) => {
        this.error = 'Error al cargar las ventas';
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  onFiltersChanged(filters: OrderFilters): void {
    this.currentFilters = filters;
    this.applyFilters();
  }

  onSearchChanged(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  applyFilters(): void {
    this.loading = true;
    
    // Obtener todas las órdenes y filtrar en el frontend
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = this.applyFrontendFilters(orders);
        this.totalItems = this.filteredOrders.length;
        this.currentPage = 1; // Resetear a la primera página
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las ventas';
        this.loading = false;
        this.errorFilter.handle(err);
      }
    });
  }

  // Método para aplicar filtros en el frontend
  private applyFrontendFilters(orders: Order[]): Order[] {
    let filtered = [...orders];

    // Filtro por búsqueda
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchLower) ||
        order.user.people.name.toLowerCase().includes(searchLower) ||
        order.user.people.lastname.toLowerCase().includes(searchLower) ||
        order.user.people.dni.includes(searchLower) ||
        order.typeOrder?.type.toLowerCase().includes(searchLower) ||
        order.invoice?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por fecha
    if (this.currentFilters.dateRange && this.currentFilters.dateRange !== 'custom') {
      const { startDate, endDate } = this.calculateDateRange(this.currentFilters.dateRange);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return orderDate >= start && orderDate <= end;
      });
    } else if (this.currentFilters.startDate && this.currentFilters.endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = new Date(this.currentFilters.startDate!);
        const end = new Date(this.currentFilters.endDate!);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Filtro por estado de pago
    if (this.currentFilters.paymentStatus) {
      filtered = filtered.filter(order => 
        order.payment?.status?.id === this.currentFilters.paymentStatus
      );
    }

    // Filtro por estado de envío
    if (this.currentFilters.shipmentStatus) {
      filtered = filtered.filter(order => 
        order.shipment?.status?.id === this.currentFilters.shipmentStatus
      );
    }

    // Filtro por tipo de orden
    if (this.currentFilters.orderType) {
      filtered = filtered.filter(order => 
        order.typeOrder?.id === this.currentFilters.orderType
      );
    }

    // Filtro por monto mínimo
    if (this.currentFilters.minTotal) {
      filtered = filtered.filter(order => {
        const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
        return total >= this.currentFilters.minTotal!;
      });
    }

    // Filtro por monto máximo
    if (this.currentFilters.maxTotal) {
      filtered = filtered.filter(order => {
        const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
        return total <= this.currentFilters.maxTotal!;
      });
    }

    // Filtro por categoría de producto
    if (this.currentFilters.categoryId) {
      filtered = filtered.filter(order => 
        order.productOrder?.some(po => 
          po.product.product.category.id === this.currentFilters.categoryId
        )
      );
    }

    // Ordenamiento
    if (this.currentFilters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (this.currentFilters.sortBy) {
          case 'id':
            aValue = a.id;
            bValue = b.id;
            break;
          case 'total':
            aValue = typeof a.total === 'string' ? parseFloat(a.total) : a.total;
            bValue = typeof b.total === 'string' ? parseFloat(b.total) : b.total;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'userName':
            aValue = `${a.user.people.name} ${a.user.people.lastname}`;
            bValue = `${b.user.people.name} ${b.user.people.lastname}`;
            break;
          default:
            aValue = a.id;
            bValue = b.id;
        }

        if (this.currentFilters.sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }

  // Método auxiliar para calcular rangos de fecha
  private calculateDateRange(range: string): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30); // Por defecto último mes
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  calculateStats(): void {
    // Calcular estadísticas basadas en órdenes filtradas
    this.totalSales = this.filteredOrders.reduce((sum, order) => Number(sum) + Number(order.total || 0), 0);
    
    this.completedOrders = this.filteredOrders.filter(order => 
      order.payment?.status?.status?.toLowerCase().includes('completado') ||
      order.payment?.status?.status?.toLowerCase().includes('pagado')
    ).length;
    
    this.pendingOrders = this.filteredOrders.filter(order => 
      order.payment?.status?.status?.toLowerCase().includes('pendiente') ||
      !order.payment?.status?.status
    ).length;

    this.totalItems = this.filteredOrders.length;
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

  // Métodos de paginación
  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Métodos de utilidad
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: string | number): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(numericAmount);
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

  // Métodos auxiliares para manejar campos opcionales
  getVouchersCount(order: Order): number {
    return order.payment?.vouchers?.length || 0;
  }

  hasVouchers(order: Order): boolean {
    return this.getVouchersCount(order) > 0;
  }

  getVouchersText(order: Order): string {
    const count = this.getVouchersCount(order);
    return `${count} abono${count > 1 ? 's' : ''}`;
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
