import api from './api';
import { RecurringTransaction, RecurringTransactionDto } from '../types';

export const recurringTransactionService = {
  getAll: async (): Promise<RecurringTransaction[]> => {
    const { data } = await api.get<RecurringTransaction[]>('/recurring-transactions');
    return data;
  },

  getById: async (id: number): Promise<RecurringTransaction> => {
    const { data } = await api.get<RecurringTransaction>(`/recurring-transactions/${id}`);
    return data;
  },

  create: async (transaction: RecurringTransactionDto): Promise<RecurringTransaction> => {
    const { data } = await api.post<RecurringTransaction>('/recurring-transactions', transaction);
    return data;
  },

  update: async (id: number, transaction: RecurringTransactionDto): Promise<RecurringTransaction> => {
    const { data } = await api.put<RecurringTransaction>(`/recurring-transactions/${id}`, transaction);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/recurring-transactions/${id}`);
  },

  toggleActive: async (id: number, active: boolean): Promise<RecurringTransaction> => {
    const { data } = await api.put<RecurringTransaction>(`/recurring-transactions/${id}/toggle`, { active });
    return data;
  },
};

