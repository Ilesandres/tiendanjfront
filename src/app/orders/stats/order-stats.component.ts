import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../interfaces/order.interface';

@Component({
  selector: 'app-order-stats',
  templateUrl: './order-stats.component.html',
  styleUrls: ['./order-stats.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class OrderStatsComponent implements OnInit {
  @Input() orders: Order[] = [];
  @Input() filteredOrders: Order[] = [];

  // Estadísticas generales
  totalSales = 0;
  totalOrders = 0;
  averageOrderValue = 0;
  
  // Estadísticas por estado
  completedOrders = 0;
  pendingOrders = 0;
  cancelledOrders = 0;
  
  // Estadísticas por método de pago
  paymentMethodStats: { [key: string]: number } = {};
  
  // Estadísticas por tipo de orden
  orderTypeStats: { [key: string]: number } = {};
  
  // Estadísticas por mes
  monthlyStats: { [key: string]: { orders: number; sales: number } } = {};

  ngOnInit(): void {
    this.calculateStats();
  }

  ngOnChanges(): void {
    this.calculateStats();
  }

  calculateStats(): void {
    const ordersToAnalyze = this.filteredOrders.length > 0 ? this.filteredOrders : this.orders;
    
    // Estadísticas básicas
    this.totalOrders = ordersToAnalyze.length;
    this.totalSales = ordersToAnalyze.reduce((sum, order) => Number(sum) + Number(order.total || 0), 0);
    this.averageOrderValue = this.totalOrders > 0 ? this.totalSales / this.totalOrders : 0;
    
    // Estadísticas por estado
    this.completedOrders = ordersToAnalyze.filter(order => 
      order.payment?.status?.status?.toLowerCase().includes('completado') ||
      order.payment?.status?.status?.toLowerCase().includes('pagado')
    ).length;
    
    this.pendingOrders = ordersToAnalyze.filter(order => 
      order.payment?.status?.status?.toLowerCase().includes('pendiente') ||
      !order.payment?.status?.status
    ).length;
    
    this.cancelledOrders = ordersToAnalyze.filter(order => 
      order.payment?.status?.status?.toLowerCase().includes('cancelado') ||
      order.payment?.status?.status?.toLowerCase().includes('rechazado')
    ).length;
    
    // Estadísticas por método de pago
    this.paymentMethodStats = {};
    ordersToAnalyze.forEach(order => {
      const method = order.payment?.method?.method || 'No especificado';
      this.paymentMethodStats[method] = (this.paymentMethodStats[method] || 0) + 1;
    });
    
    // Estadísticas por tipo de orden
    this.orderTypeStats = {};
    ordersToAnalyze.forEach(order => {
      const type = order.typeOrder?.type || 'No especificado';
      this.orderTypeStats[type] = (this.orderTypeStats[type] || 0) + 1;
    });
    
    // Estadísticas por mes
    this.monthlyStats = {};
    ordersToAnalyze.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!this.monthlyStats[monthKey]) {
        this.monthlyStats[monthKey] = { orders: 0, sales: 0 };
      }
      
      this.monthlyStats[monthKey].orders++;
      this.monthlyStats[monthKey].sales += Number(order.total) || 0;
    });
  }

  // Métodos de utilidad
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completado') || statusLower.includes('pagado')) {
      return 'status-completed';
    } else if (statusLower.includes('pendiente')) {
      return 'status-pending';
    } else if (statusLower.includes('cancelado') || statusLower.includes('rechazado')) {
      return 'status-cancelled';
    }
    return 'status-unknown';
  }

  // Métodos para obtener top items
  getTopPaymentMethods(limit: number = 5): Array<{ method: string; count: number; percentage: number }> {
    return Object.entries(this.paymentMethodStats)
      .map(([method, count]) => ({
        method,
        count,
        percentage: this.calculatePercentage(count, this.totalOrders)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopOrderTypes(limit: number = 5): Array<{ type: string; count: number; percentage: number }> {
    return Object.entries(this.orderTypeStats)
      .map(([type, count]) => ({
        type,
        count,
        percentage: this.calculatePercentage(count, this.totalOrders)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopMonths(limit: number = 6): Array<{ month: string; orders: number; sales: number }> {
    return Object.entries(this.monthlyStats)
      .map(([monthKey, stats]) => ({
        month: this.formatMonth(monthKey),
        orders: stats.orders,
        sales: stats.sales
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
      .slice(0, limit);
  }
} 