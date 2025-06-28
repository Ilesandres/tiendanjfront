export interface Category {
  id: number;
  category: string;
  active: boolean;
}

export interface CreateCategoryRequest {
  category: string;
}

export interface UpdateCategoryRequest {
  category: string;
} 