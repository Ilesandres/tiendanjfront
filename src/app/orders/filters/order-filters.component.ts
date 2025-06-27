import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { OrderFilters } from '../../interfaces/order.interface';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-order-filters',
  templateUrl: './order-filters.component.html',
  styleUrls: ['./order-filters.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class OrderFiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<OrderFilters>();
  @Output() searchChanged = new EventEmitter<string>();

  filtersForm: FormGroup;
  loading = false;
  showAdvancedFilters = false;

  // Opciones de filtros
  dateRanges = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'quarter', label: 'Último trimestre' },
    { value: 'year', label: 'Último año' },
    { value: 'custom', label: 'Personalizado' }
  ];

  sortOptions = [
    { value: 'id', label: 'ID de orden' },
    { value: 'total', label: 'Total' },
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'userName', label: 'Nombre del cliente' }
  ];

  sortOrders = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
  ];

  // Estados predefinidos (se pueden obtener del backend si es necesario)
  paymentStatuses = [
    { id: 1, status: 'Pendiente' },
    { id: 2, status: 'Pagado' },
    { id: 3, status: 'Rechazado' }
  ];

  shipmentStatuses = [
    { id: 1, status: 'Pendiente' },
    { id: 2, status: 'Enviado' },
    { id: 3, status: 'Entregado' }
  ];

  orderTypes = [
    { id: 1, type: 'Compra' },
    { id: 2, type: 'Venta' },
    { id: 3, type: 'Devolución' }
  ];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    public userService: UserService
  ) {
    this.filtersForm = this.fb.group({
      searchTerm: [''],
      dateRange: ['month'],
      startDate: [''],
      endDate: [''],
      userId: [''],
      userDni: [''],
      paymentStatus: [''],
      shipmentStatus: [''],
      orderType: [''],
      minTotal: [''],
      maxTotal: [''],
      productId: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc'],
      page: [1],
      limit: [20]
    });
  }

  ngOnInit(): void {
    // Escuchar cambios en el formulario
    this.filtersForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const formValue = this.filtersForm.value;
    
    // Preparar filtros
    const filters: OrderFilters = {
      dateRange: formValue.dateRange,
      sortBy: formValue.sortBy,
      sortOrder: formValue.sortOrder,
      page: formValue.page,
      limit: formValue.limit
    };

    // Agregar filtros opcionales solo si tienen valor
    if (formValue.startDate) filters.startDate = formValue.startDate;
    if (formValue.endDate) filters.endDate = formValue.endDate;
    if (formValue.userId) filters.userId = parseInt(formValue.userId);
    if (formValue.userDni) filters.userDni = formValue.userDni;
    if (formValue.paymentStatus) filters.paymentStatus = parseInt(formValue.paymentStatus);
    if (formValue.shipmentStatus) filters.shipmentStatus = parseInt(formValue.shipmentStatus);
    if (formValue.orderType) filters.orderType = parseInt(formValue.orderType);
    if (formValue.minTotal) filters.minTotal = parseFloat(formValue.minTotal);
    if (formValue.maxTotal) filters.maxTotal = parseFloat(formValue.maxTotal);
    if (formValue.productId) filters.productId = parseInt(formValue.productId);

    // Emitir filtros
    this.filtersChanged.emit(filters);

    // Emitir término de búsqueda si existe
    if (formValue.searchTerm) {
      this.searchChanged.emit(formValue.searchTerm);
    }
  }

  clearFilters(): void {
    this.filtersForm.patchValue({
      searchTerm: '',
      dateRange: 'month',
      startDate: '',
      endDate: '',
      userId: '',
      userDni: '',
      paymentStatus: '',
      shipmentStatus: '',
      orderType: '',
      minTotal: '',
      maxTotal: '',
      productId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    });
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onDateRangeChange(): void {
    const dateRange = this.filtersForm.get('dateRange')?.value;
    if (dateRange === 'custom') {
      // Habilitar campos de fecha personalizada
      this.filtersForm.get('startDate')?.enable();
      this.filtersForm.get('endDate')?.enable();
    } else {
      // Deshabilitar campos de fecha personalizada
      this.filtersForm.get('startDate')?.disable();
      this.filtersForm.get('endDate')?.disable();
      this.filtersForm.patchValue({
        startDate: '',
        endDate: ''
      });
    }
  }

  // Métodos de utilidad
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }
} 