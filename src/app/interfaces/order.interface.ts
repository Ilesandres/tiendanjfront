export interface TypeOrder {
  id: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatus {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: number;
  method: string;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: number;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  vouchers?: Voucher[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentStatus {
  id: number;
  status: string;
}

export interface Shipment {
  id: number;
  status: ShipmentStatus;
  details: string;
}

export interface ProductOrder {
  id: number;
  product: {
    id: number;
    price: number;
    stock: number;
    active: boolean;
    image: string | null;
    color?: {
      id: number;
      color: string;
    };
    spice?: {
      id: number;
      spice: string;
    };
    measure?: {
      id: number;
      measure: string;
    };
    product: {
      id: number;
      product: string;
      active: boolean;
      category: {
        id: number;
        category: string;
        active: boolean;
      };
    };
  };
  amount: number;
}

export interface Order {
  id: number;
  user: {
    id: number;
    people: {
      id: number;
      name: string;
      lastname: string;
      phone: string;
      birthdate: string;
      email: string;
      typeDni: {
        id: number;
        name: string;
      };
      dni: string;
    };
    user: string;
    verificationCode: string | null;
    token: string | null;
    datesendverify: string | null;
    verify: boolean;
  };
  total: string | number;
  createdAt: string;
  updatedAt?: string;
  invoice: string | null;
  
  payment?: {
    id: number;
    method: {
      id: number;
      method: string;
    };
    status: {
      id: number;
      status: string;
    };
    createdAt: string;
    vouchers?: Voucher[];
  };
  
  typeOrder?: {
    id: number;
    type: string;
  };
  
  productOrder?: ProductOrder[];
  
  shipment?: {
    id: number;
    status: {
      id: number;
      status: string;
    };
    details: string;
  };
}

export interface User {
  id: number;
  user: string;
  rol: string;
  verify: boolean;
  people: People;
  verificationCode?: any;
  token?: any;
  datesendverify?: any;
}

export interface People {
  id: number;
  name: string;
  lastname: string;
  phone?: string;
  birthdate?: string;
  email?: string;
  dni: string;
  typeDni: TypeDni;
}

export interface TypeDni {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  product: string;
  category?: Category;
  active: boolean;
  image?: string;
  variationProducts?: any[];
  price?: number;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  // Filtros por cliente (según endpoint del JSON)
  userId?: number;
  userDni?: string;
  user?: string; // username del usuario
  
  // Filtros por fecha
  startDate?: string;
  endDate?: string;
  dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  date?: string; // fecha específica
  
  // Filtros por estado (según endpoint del JSON)
  status?: string; // estado general
  paymentStatus?: number;
  shipmentStatus?: number;
  statusPayment?: string;
  statusShipment?: string;
  statusPaymentMethod?: string;
  
  // Filtros por tipo de orden
  orderType?: number;
  typeOrder?: string;
  
  // Filtros por monto
  minTotal?: number;
  maxTotal?: number;
  total?: number; // monto específico
  
  // Filtros por método de pago
  paymentMethod?: string;
  
  // Filtros por envío
  shipment?: string;
  
  // Filtros por producto
  productId?: number;
  
  // Filtros por categoría
  categoryId?: number;
  
  // Ordenamiento
  sortBy?: 'id' | 'total' | 'createdAt' | 'userName';
  sortOrder?: 'asc' | 'desc';
  
  // Paginación
  page?: number;
  limit?: number;
}

export interface CreateOrderRequest {
  user: {
    id: number;
  };
  payment?: {
    method: {
      id: number;
    };
    status: {
      id: number;
    };
  };
  typeOrder?: {
    id: number;
  };
  productOrder?: {
    id: number;
  }[];
}

export interface UpdateOrderRequest {
  user?: {
    id: number;
  };
  payment?: {
    method: {
      id: number;
    };
    status: {
      id: number;
    };
  };
  typeOrder?: {
    id: number;
  };
  productOrder?: {
    id: number;
  }[];
}

export interface UpdateOrderTotalRequest {
  total: number;
}

export interface CreatePaymentRequest {
  method: { id: number };
  status: { id: number };
}

export interface UpdatePaymentRequest {
  method?: { id: number };
  status?: { id: number };
}

export interface CreateProductOrderRequest {
  order: { id: number };
  product: { id: number };
  amount: number;
}

export interface UpdateProductOrderRequest {
  order: { id: number };
  product: { id: number };
  amount: number;
}

export interface CreateVoucherRequest {
  payment: { id: number };
  value: number;
} 