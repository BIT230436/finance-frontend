import api from './api';
import { Budget, BudgetDto } from '../types';

export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    const { data } = await api.get<Budget[]>('/budgets');
    return data;
  },

  getById: async (id: number): Promise<Budget> => {
    const { data } = await api.get<Budget>(`/budgets/${id}`);
    return data;
  },

  create: async (budget: BudgetDto): Promise<Budget> => {
    console.log('[BudgetService] Creating budget:', budget);
    try {
      const { data } = await api.post<Budget>('/budgets', budget);
      console.log('[BudgetService] Create success:', data);
      return data;
    } catch (error: any) {
      console.error('[BudgetService] Create error:', error);
      throw error;
    }
  },

  update: async (id: number, budget: BudgetDto): Promise<Budget> => {
    const { data } = await api.put<Budget>(`/budgets/${id}`, budget);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },

  getAlerts: async (): Promise<Budget[]> => {
    const { data } = await api.get<Budget[]>('/budgets/alerts');
    return data;
  },

  // Budget recommendations from backend
  getRecommendation: async (categoryId: number, months: number = 3): Promise<any> => {
    const { data } = await api.get(
      `/budget-recommendations/category/${categoryId}?months=${months}`
    );
    return data;
  },

  getAllRecommendations: async (months: number = 3): Promise<any[]> => {
    const { data } = await api.get<any[]>(
      `/budget-recommendations/all?months=${months}`
    );
    return data;
  },
};

