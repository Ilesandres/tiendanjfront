import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { 
  Category, 
  Color, 
  Spice, 
  Measure, 
  Product, 
  ProductVariation, 
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariationRequest,
  UpdateVariationRequest
} from '../interfaces/product.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  // Categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/category/all`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/category/one/${id}`);
  }

  getCategoryByName(name: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/category/name/${name}`);
  }

  createCategory(category: { category: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/category/create`, category, { headers });
  }

  updateCategory(id: number, category: { category: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/category/update/${id}`, category, { headers });
  }

  deleteCategory(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/category/delete/${id}`, { headers });
  }

  disableCategory(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/category/disable/${id}`, {}, { headers });
  }

  enableCategory(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/category/enable/${id}`, {}, { headers });
  }

  // Colors
  getAllColors(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.apiUrl}/color/all`);
  }

  getColorById(id: number): Observable<Color> {
    return this.http.get<Color>(`${this.apiUrl}/color/id/${id}`);
  }

  getColorByName(name: string): Observable<Color> {
    return this.http.get<Color>(`${this.apiUrl}/color/name/${name}`);
  }

  createColor(color: { color: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/color/create`, color, { headers });
  }

  updateColor(id: number, color: { color: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/color/update/${id}`, color, { headers });
  }

  deleteColor(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/color/delete/${id}`, { headers });
  }

  // Spices
  getAllSpices(): Observable<Spice[]> {
    return this.http.get<Spice[]>(`${this.apiUrl}/spice/all`);
  }

  getSpiceById(id: number): Observable<Spice> {
    return this.http.get<Spice>(`${this.apiUrl}/spice/id/${id}`);
  }

  getSpiceByName(name: string): Observable<Spice> {
    return this.http.get<Spice>(`${this.apiUrl}/spice/name/${name}`);
  }

  createSpice(spice: { spice: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/spice/create`, spice, { headers });
  }

  updateSpice(id: number, spice: { spice: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/spice/update/${id}`, spice, { headers });
  }

  deleteSpice(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/spice/delete/${id}`, { headers });
  }

  // Measures
  getAllMeasures(): Observable<Measure[]> {
    return this.http.get<Measure[]>(`${this.apiUrl}/typemeasuremedida/all`);
  }

  getMeasureById(id: number): Observable<Measure> {
    return this.http.get<Measure>(`${this.apiUrl}/typemeasuremedida/id/${id}`);
  }

  getMeasureByName(name: string): Observable<Measure> {
    return this.http.get<Measure>(`${this.apiUrl}/typemeasuremedida/name/${name}`);
  }

  createMeasure(measure: { measure: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/typemeasuremedida/create`, measure, { headers });
  }

  updateMeasure(id: number, measure: { measure: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/typemeasuremedida/update/${id}`, measure, { headers });
  }

  deleteMeasure(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/typemeasuremedida/delete/${id}`, { headers });
  }

  // Products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/product/all`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/one/${id}`);
  }

  getProductByName(name: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/name/${name}`);
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/product/category/${categoryId}`);
  }

  getProductsWithFilters(filters: ProductFilters): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.apiUrl}/product/filters`, filters);
  }

  createProduct(product: CreateProductRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/product/create`, product, { headers });
  }

  updateProduct(id: number, product: UpdateProductRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/product/update/${id}`, product, { headers });
  }

  changeProductStatus(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/product/change-status/${id}`, {}, { headers });
  }

  deleteProduct(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/product/delete/${id}`, { headers });
  }

  // Product Variations
  getAllVariations(): Observable<ProductVariation[]> {
    return this.http.get<ProductVariation[]>(`${this.apiUrl}/variationproduct/all`);
  }

  getVariationById(id: number): Observable<ProductVariation> {
    return this.http.get<ProductVariation>(`${this.apiUrl}/variationproduct/findbyid/${id}`);
  }

  getVariationsByProductId(productId: number): Observable<ProductVariation[]> {
    return this.http.get<ProductVariation[]>(`${this.apiUrl}/variationproduct/findbyproductid/${productId}`);
  }

  createVariation(variation: CreateVariationRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/variationproduct/create`, variation, { headers });
  }

  updateVariation(id: number, variation: UpdateVariationRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/variationproduct/update/${id}`, variation, { headers });
  }

  deleteVariation(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/variationproduct/delete/${id}`, { headers });
  }

  changeVariationStatus(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/variationproduct/change-status/${id}`, {}, { headers });
  }

  updateVariationStock(id: number, stock: { stock: number }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/variationproduct/change-stock/${id}`, stock, { headers });
  }

  searchVariationsByDescription(description: string): Observable<ProductVariation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProductVariation[]>(`${this.apiUrl}/variationproduct/findbydescription/${encodeURIComponent(description)}`, { headers:headers});
  }

  // Convenience methods for component use
  async getCategories(): Promise<Category[]> {
    try {
      const result = await firstValueFrom(this.getAllCategories());
      return result || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getSpices(): Promise<Spice[]> {
    try {
      const result = await firstValueFrom(this.getAllSpices());
      return result || [];
    } catch (error) {
      console.error('Error getting spices:', error);
      return [];
    }
  }

  async getMeasures(): Promise<Measure[]> {
    try {
      const result = await firstValueFrom(this.getAllMeasures());
      return result || [];
    } catch (error) {
      console.error('Error getting measures:', error);
      return [];
    }
  }

  async getColors(): Promise<Color[]> {
    try {
      const result = await firstValueFrom(this.getAllColors());
      return result || [];
    } catch (error) {
      console.error('Error getting colors:', error);
      return [];
    }
  }

  // Async versions of create methods
  async createProductAsync(product: CreateProductRequest): Promise<any> {
    return firstValueFrom(this.createProduct(product));
  }

  async createVariationAsync(variation: CreateVariationRequest): Promise<any> {
    return firstValueFrom(this.createVariation(variation));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
} 