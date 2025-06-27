import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../interfaces/category.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todas las categorías
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/category/all`);
  }

  // Obtener categoría por ID
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/category/one/${id}`);
  }

  // Obtener categoría por nombre
  getCategoryByName(name: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/category/name/${name}`);
  }

  // Crear nueva categoría (admin, seller)
  createCategory(categoryData: CreateCategoryRequest): Observable<Category> {
    const headers = this.getAuthHeaders();
    return this.http.post<Category>(`${this.apiUrl}/category/create`, categoryData, { headers });
  }

  // Actualizar categoría (admin, seller)
  updateCategory(id: number, categoryData: UpdateCategoryRequest): Observable<Category> {
    const headers = this.getAuthHeaders();
    return this.http.post<Category>(`${this.apiUrl}/category/update/${id}`, categoryData, { headers });
  }

  // Deshabilitar categoría (admin, seller)
  disableCategory(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/category/disable/${id}`, {}, { headers });
  }

  // Habilitar categoría (admin, seller)
  enableCategory(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/category/enable/${id}`, {}, { headers });
  }

  // Eliminar categoría (admin)
  deleteCategory(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/category/delete/${id}`, { headers });
  }
} 