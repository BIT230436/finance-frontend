import api from './api';
import { Category, CategoryDto } from '../types';

export const categoryService = {
  getAll: async (type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> => {
    const url = type ? `/categories?type=${type}` : '/categories';
    const { data } = await api.get<Category[]>(url);
    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  create: async (category: CategoryDto): Promise<Category> => {
    console.log('[CategoryService] Creating category:', category);
    try {
      const { data } = await api.post<Category>('/categories', category);
      console.log('[CategoryService] Create success:', data);
      return data;
    } catch (error: any) {
      console.error('[CategoryService] Create error:', error);
      throw error;
    }
  },

  update: async (id: number, category: CategoryDto): Promise<Category> => {
    const { data } = await api.put<Category>(`/categories/${id}`, category);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

