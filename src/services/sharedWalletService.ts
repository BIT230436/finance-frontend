import api from './api';
import { SharedWallet, SharedWalletInvitation, SharedWalletMember } from '../types';

export const sharedWalletService = {
  getSharedWallets: async (): Promise<SharedWallet[]> => {
    const { data } = await api.get<SharedWallet[]>('/wallet-shares/shared-with-me');
    return data;
  },

  getWalletMembers: async (walletId: number): Promise<SharedWalletMember[]> => {
    const { data } = await api.get<SharedWalletMember[]>(`/wallet-shares/wallet/${walletId}`);
    return data;
  },

  inviteMember: async (walletId: number, invitation: SharedWalletInvitation): Promise<void> => {
    await api.post(`/wallet-shares/wallet/${walletId}`, invitation);
  },

  acceptInvitation: async (id: number): Promise<void> => {
    // Note: Backend may handle acceptance differently, check guide
    await api.post(`/wallet-shares/${id}/accept`);
  },

  rejectInvitation: async (id: number): Promise<void> => {
    await api.delete(`/wallet-shares/${id}`);
  },

  removeMember: async (id: number): Promise<void> => {
    await api.delete(`/wallet-shares/${id}`);
  },

  updateMemberPermission: async (id: number, permission: 'READ_ONLY' | 'EDIT'): Promise<void> => {
    await api.put(`/wallet-shares/${id}/permission`, { permission });
  },
};

