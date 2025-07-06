export interface Category {
  id: number;
  category: string;
  active: boolean;
}

export interface Color {
  id: number;
  color: string;
}

export interface Spice {
  id: number;
  spice: string;
}

export interface Measure {
  id: number;
  measure: string;
}

export interface Product {
  id: number;
  product: string;
  category?: Category;
  active: boolean;
  image?: string;
  variationProducts?: ProductVariation[];
  variation?: any[]; // Campo que viene del backend con las variaciones
}

export interface ProductVariation {
  id: number;
  spice: Spice;
  price: number;
  stock: number;
  product: Product;
  measure?: Measure;
  color?: Color;
  image?: string;
  description?: string;
  active: boolean;
}

export interface ProductFilters {
  category?: {
    id: number;
    category?: string;
    active?: boolean;
  };
  name?: string;
  variationActive?: string; // "true" o "false" como string
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  spice?: {
    id: number;
    spice?: string;
  };
  measure?: {
    id: number;
    measure?: string;
  };
}

export interface CreateProductRequest {
  product: string;
  category?: {
    id: number;
  };
}

export interface UpdateProductRequest {
  product?: string;
  category?: {
    id: number;
  };
}

export interface CreateVariationRequest {
  spice: {
    id: number;
  };
  price: number;
  stock: number;
  product: {
    id: number;
  };
  measure?: {
    id: number;
  };
  color?: {
    id: number;
  };
  image?: string;
  description?: string;
}

export interface UpdateVariationRequest {
  price?: number;
  stock?: number;
  image?: string;
  description?: string;
} 