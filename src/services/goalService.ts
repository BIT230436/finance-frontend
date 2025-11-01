import api from './api';
import { FinancialGoal, FinancialGoalDto } from '../types';

export const goalService = {
  getAll: async (active?: boolean): Promise<FinancialGoal[]> => {
    const url = active !== undefined ? `/financial-goals?active=${active}` : '/financial-goals';
    const { data } = await api.get<FinancialGoal[]>(url);
    return data;
  },

  getById: async (id: number): Promise<FinancialGoal> => {
    const { data } = await api.get<FinancialGoal>(`/financial-goals/${id}`);
    return data;
  },

  create: async (goal: FinancialGoalDto): Promise<FinancialGoal> => {
    const { data } = await api.post<FinancialGoal>('/financial-goals', goal);
    return data;
  },

  update: async (id: number, goal: FinancialGoalDto): Promise<FinancialGoal> => {
    const { data } = await api.put<FinancialGoal>(`/financial-goals/${id}`, goal);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/financial-goals/${id}`);
  },

  addProgress: async (id: number, amount: number): Promise<FinancialGoal> => {
    const { data } = await api.post<FinancialGoal>(`/financial-goals/${id}/progress`, { amount });
    return data;
  },
};

