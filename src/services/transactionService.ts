import api from './api';
import { Transaction, TransactionDto, TransferRequest } from '../types';

interface TransactionFilters {
  categoryId?: number;
  walletId?: number;
  type?: 'INCOME' | 'EXPENSE';
  startDate?: string;
  endDate?: string;
  keyword?: string;
  minAmount?: number;
  maxAmount?: number;
  datePreset?: 'today' | 'yesterday' | 'thisweek' | 'thismonth' | 'thisyear' | 'last30days' | 'last3months';
}

export interface CategorySuggestion {
  categoryId: number;
  categoryName: string;
  score: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface DuplicateTransaction {
  transactionId: number;
  amount: number;
  note?: string;
  occurredAt: string;
  categoryId: number;
  walletId: number;
}

export const transactionService = {
  getAll: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.walletId) params.append('walletId', filters.walletId.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.keyword) params.append('keyword', filters.keyword);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    if (filters?.datePreset) params.append('datePreset', filters.datePreset);

    const queryString = params.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';
    const { data } = await api.get<Transaction[]>(url);
    return data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const { data } = await api.get<Transaction>(`/transactions/${id}`);
    return data;
  },

  create: async (transaction: TransactionDto): Promise<Transaction> => {
    console.log('[TransactionService] Creating transaction:', transaction);
    try {
      const { data } = await api.post<Transaction>('/transactions', transaction);
      console.log('[TransactionService] Create success:', data);
      return data;
    } catch (error: any) {
      console.error('[TransactionService] Create error:', error);
      throw error;
    }
  },

  update: async (id: number, transaction: TransactionDto): Promise<Transaction> => {
    const { data } = await api.put<Transaction>(`/transactions/${id}`, transaction);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  transfer: async (transferData: TransferRequest): Promise<void> => {
    await api.post('/transactions/transfer', transferData);
  },

  // New endpoints from backend
  getCategorySuggestions: async (
    note: string,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<CategorySuggestion[]> => {
    const params = new URLSearchParams();
    params.append('note', note);
    params.append('type', type);
    const { data } = await api.get<CategorySuggestion[]>(
      `/transactions/suggestions/categories?${params.toString()}`
    );
    return data;
  },

  getAmountSuggestions: async (categoryId: number): Promise<number[]> => {
    const { data } = await api.get<number[]>(
      `/transactions/suggestions/amounts?categoryId=${categoryId}`
    );
    return data;
  },

  quickCreate: async (transaction: {
    amount: number;
    categoryId: number;
    walletId?: number;
    note?: string;
    type?: 'INCOME' | 'EXPENSE';
  }): Promise<Transaction> => {
    console.log('[TransactionService] Quick creating transaction:', transaction);
    const { data } = await api.post<Transaction>('/transactions/quick', transaction);
    console.log('[TransactionService] Quick create success:', data);
    return data;
  },

  checkDuplicates: async (params: {
    categoryId?: number;
    walletId?: number;
    amount?: number;
    date?: string;
  }): Promise<DuplicateTransaction[]> => {
    const queryParams = new URLSearchParams();
    if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params.walletId) queryParams.append('walletId', params.walletId.toString());
    if (params.amount) queryParams.append('amount', params.amount.toString());
    if (params.date) queryParams.append('date', params.date);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/transactions/duplicates?${queryString}` : '/transactions/duplicates';
    const { data } = await api.get<DuplicateTransaction[]>(url);
    return data;
  },

  getRecent: async (limit: number = 10): Promise<Transaction[]> => {
    const { data } = await api.get<Transaction[]>(`/transactions/recent?limit=${limit}`);
    return data;
  },
};

