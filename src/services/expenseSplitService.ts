import api from './api';
import { SplitExpense, SplitExpenseDto, PendingSplitPayment } from '../types';

export const expenseSplitService = {
  /**
   * Create a new expense split
   */
  create: async (split: SplitExpenseDto): Promise<SplitExpense> => {
    const { data } = await api.post<SplitExpense>('/split-expenses', split);
    return data;
  },

  /**
   * Get all split expenses
   */
  getAll: async (): Promise<SplitExpense[]> => {
    const { data } = await api.get<SplitExpense[]>('/split-expenses');
    return data;
  },

  /**
   * Get pending payments for current user
   */
  getPendingPayments: async (): Promise<PendingSplitPayment[]> => {
    const { data } = await api.get<PendingSplitPayment[]>('/split-expenses/pending');
    return data;
  },

  /**
   * Mark a split expense as paid
   */
  markPaid: async (splitId: number): Promise<void> => {
    await api.put(`/split-expenses/${splitId}/mark-paid`);
  },
};

