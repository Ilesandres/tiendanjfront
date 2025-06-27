import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  TypeOrder, 
  PaymentStatus, 
  PaymentMethod, 
  Payment, 
  ShipmentStatus, 
  Shipment, 
  ProductOrder, 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  Voucher,
  CreateVoucherRequest,
  User
} from '../interfaces/order.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Type Orders
  getAllTypeOrders(): Observable<TypeOrder[]> {
    return this.http.get<TypeOrder[]>(`${this.apiUrl}/typeorder/all`);
  }

  getTypeOrderById(id: number): Observable<TypeOrder> {
    return this.http.get<TypeOrder>(`${this.apiUrl}/typeorder/id/${id}`);
  }

  getTypeOrderByName(name: string): Observable<TypeOrder> {
    return this.http.get<TypeOrder>(`${this.apiUrl}/typeorder/name/${name}`);
  }

  createTypeOrder(typeOrder: { type: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/typeorder/create`, typeOrder, { headers });
  }

  updateTypeOrder(id: number, typeOrder: { type: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/typeorder/update/${id}`, typeOrder, { headers });
  }

  deleteTypeOrder(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/typeorder/delete/${id}`, { headers });
  }

  // Payment Statuses
  getAllPaymentStatus(): Observable<PaymentStatus[]> {
    return this.http.get<PaymentStatus[]>(`${this.apiUrl}/paymentstatus/all`);
  }

  getPaymentStatusById(id: number): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(`${this.apiUrl}/paymentstatus/id/${id}`);
  }

  getPaymentStatusByName(name: string): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(`${this.apiUrl}/paymentstatus/name/${name}`);
  }

  createPaymentStatus(status: any): Observable<PaymentStatus> {
    const headers = this.getAuthHeaders();
    return this.http.post<PaymentStatus>(`${this.apiUrl}/paymentstatus/create`, status, { headers });
  }

  updatePaymentStatus(id: number, status: any): Observable<PaymentStatus> {
    const headers = this.getAuthHeaders();
    return this.http.post<PaymentStatus>(`${this.apiUrl}/paymentstatus/update/${id}`, status, { headers });
  }

  deletePaymentStatus(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/paymentstatus/delete/${id}`, { headers });
  }

  // Payment Methods
  getAllPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/paymenthmethod/all`);
  }

  getPaymentMethodById(id: number): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.apiUrl}/paymenthmethod/id/${id}`);
  }

  getPaymentMethodByName(name: string): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.apiUrl}/paymenthmethod/name/${name}`);
  }

  createPaymentMethod(method: { method: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/paymenthmethod/create`, method, { headers });
  }

  updatePaymentMethod(id: number, method: { method: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/paymenthmethod/update/${id}`, method, { headers });
  }

  deletePaymentMethod(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/paymenthmethod/delete/${id}`, { headers });
  }

  // Payments
  getAllPayments(): Observable<Payment[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Payment[]>(`${this.apiUrl}/payment/all`, { headers });
  }

  getPaymentById(id: number): Observable<Payment> {
    const headers = this.getAuthHeaders();
    return this.http.get<Payment>(`${this.apiUrl}/payment/id/${id}`, { headers });
  }

  getPaymentByOrderId(orderId: number): Observable<Payment> {
    const headers = this.getAuthHeaders();
    return this.http.get<Payment>(`${this.apiUrl}/payment/order/${orderId}`, { headers });
  }

  createPayment(payment: { method: { id: number }, status: { id: number } }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/payment/create`, payment, { headers });
  }

  updatePayment(id: number, payment: { method?: { id: number }, status?: { id: number } }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/payment/update/${id}`, payment, { headers });
  }

  deletePayment(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/payment/delete/${id}`, { headers });
  }

  // Shipment Status
  getAllShipmentStatus(): Observable<ShipmentStatus[]> {
    return this.http.get<ShipmentStatus[]>(`${this.apiUrl}/statusshipment/all`);
  }

  getShipmentStatusById(id: number): Observable<ShipmentStatus> {
    return this.http.get<ShipmentStatus>(`${this.apiUrl}/statusshipment/id/${id}`);
  }

  getShipmentStatusByName(name: string): Observable<ShipmentStatus> {
    return this.http.get<ShipmentStatus>(`${this.apiUrl}/statusshipment/name/${name}`);
  }

  createShipmentStatus(status: { status: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/statusshipment/create`, status, { headers });
  }

  updateShipmentStatus(id: number, status: { status: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/statusshipment/update/${id}`, status, { headers });
  }

  deleteShipmentStatus(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/statusshipment/delete/${id}`, { headers });
  }

  // Shipments
  getAllShipments(): Observable<Shipment[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Shipment[]>(`${this.apiUrl}/shipment/all`, { headers });
  }

  getShipmentById(id: number): Observable<Shipment> {
    const headers = this.getAuthHeaders();
    return this.http.get<Shipment>(`${this.apiUrl}/shipment/id/${id}`, { headers });
  }

  getShipmentByOrderId(orderId: number): Observable<Shipment> {
    const headers = this.getAuthHeaders();
    return this.http.get<Shipment>(`${this.apiUrl}/order/shipment/id/${orderId}`, { headers });
  }

  createShipment(shipment: { order: { id: number }, status: { id: number }, details: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/shipment/create`, shipment, { headers });
  }

  updateShipment(id: number, shipment: { order: { id: number }, status: { id: number }, details: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/shipment/update/${id}`, shipment, { headers });
  }

  deleteShipment(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/shipment/delete/${id}`, { headers });
  }

  // Product Orders
  addProductToOrder(productOrder: { order: { id: number }, product: { id: number }, amount: number }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/productorder/add-product-to-order`, productOrder, { headers });
  }

  updateProductFromOrder(id: number, productOrder: { order: { id: number }, product: { id: number }, amount: number }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/productorder/update-product-from-order/${id}`, productOrder, { headers });
  }

  getProductOrdersByOrderId(orderId: number): Observable<ProductOrder[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProductOrder[]>(`${this.apiUrl}/productorder/find-by-order-id/${orderId}`, { headers });
  }

  deleteProductFromOrder(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/productorder/delete-product-from-order/${id}`, { headers });
  }

  // Orders
  getAllOrders(): Observable<Order[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Order[]>(`${this.apiUrl}/order/all`, { headers });
  }

  getOrderById(id: number): Observable<Order> {
    const headers = this.getAuthHeaders();
    return this.http.get<Order>(`${this.apiUrl}/order/id/${id}`, { headers });
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Order[]>(`${this.apiUrl}/order/user/id/${userId}`, { headers });
  }

  getOrdersByUserDni(dni: string): Observable<Order[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Order[]>(`${this.apiUrl}/order/user/dni/${dni}`, { headers });
  }

  createOrder(order: CreateOrderRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/order/create`, order, { headers });
  }

  updateOrder(id: number, order: UpdateOrderRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/order/update/${id}`, order, { headers });
  }

  updateOrderTotal(id: number, total: { total: number }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/order/update/total/${id}`, total, { headers });
  }

  // Vouchers
  getAllVouchers(): Observable<Voucher[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Voucher[]>(`${this.apiUrl}/vouchersabonos/all`, { headers });
  }

  getVoucherById(id: number): Observable<Voucher> {
    const headers = this.getAuthHeaders();
    return this.http.get<Voucher>(`${this.apiUrl}/vouchersabonos/id/${id}`, { headers });
  }

  getVouchersByPaymentId(paymentId: number): Observable<Voucher[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Voucher[]>(`${this.apiUrl}/vouchersabonos/payment/${paymentId}`, { headers });
  }

  createVoucher(voucher: CreateVoucherRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/vouchersabonos/create`, voucher, { headers });
  }

  updateVoucher(id: number, voucher: CreateVoucherRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/vouchersabonos/update/${id}`, voucher, { headers });
  }

  deleteVoucher(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/vouchersabonos/delete/${id}`, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
} 