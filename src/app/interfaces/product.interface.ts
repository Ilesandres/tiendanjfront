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
}

export interface ProductVariation {
  id: number;
  spice: Spice;
  price: number;
  stock: number;
  product: Product;
  measure: Measure;
  color: Color;
  image?: string;
  active: boolean;
}

export interface ProductFilters {
  category?: Category;
  name?: string;
  variationActive?: boolean;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  spice?: Spice;
  measure?: Measure;
}

export interface CreateProductRequest {
  product: string;
  category?: number;
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
  measure: {
    id: number;
  };
  color: {
    id: number;
  };
  image?: string;
}

export interface UpdateVariationRequest {
  price?: number;
  stock?: number;
  spice?: {
    id: number;
  };
  measure?: {
    id: number;
  };
  color?: {
    id: number;
  };
  image?: string;
} 