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
  product: Product;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  user: User;
  payment?: Payment;
  shipment?: Shipment;
  typeOrder?: TypeOrder;
  productOrder?: ProductOrder[];
  total: string | number;
  createdAt: string;
  updatedAt: string;
  invoice?: any;
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

export interface CreateOrderRequest {
  user: { id: number };
  payment?: {
    method: { id: number };
    status: { id: number };
  };
  typeOrder?: { id: number };
  productOrder?: { id: number }[];
}

export interface UpdateOrderRequest {
  user: { id: number };
  payment?: {
    method: { id: number };
    status: { id: number };
  };
  typeOrder?: { id: number };
  productOrder?: { id: number }[];
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