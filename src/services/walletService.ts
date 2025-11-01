import api from './api';
import { Wallet, WalletDto } from '../types';

export const walletService = {
  getAll: async (): Promise<Wallet[]> => {
    const { data } = await api.get<Wallet[]>('/wallets');
    return data;
  },

  getById: async (id: number): Promise<Wallet> => {
    const { data } = await api.get<Wallet>(`/wallets/${id}`);
    return data;
  },

  create: async (wallet: WalletDto): Promise<Wallet> => {
    console.log('[WalletService] Creating wallet:', wallet);
    try {
      const { data } = await api.post<Wallet>('/wallets', wallet);
      console.log('[WalletService] Create success:', data);
      return data;
    } catch (error: any) {
      console.error('[WalletService] Create error:', error);
      throw error;
    }
  },

  update: async (id: number, wallet: WalletDto): Promise<Wallet> => {
    const { data } = await api.put<Wallet>(`/wallets/${id}`, wallet);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/wallets/${id}`);
  },
};

