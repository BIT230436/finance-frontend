import api from './api';
import { AdminUser, ActivityLog } from '../types';

export const adminService = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get<AdminUser[]>('/admin/users');
    return data;
  },

  getUserById: async (id: number): Promise<AdminUser> => {
    const { data } = await api.get<AdminUser>(`/admin/users/${id}`);
    return data;
  },

  updateUserRole: async (id: number, role: 'ADMIN' | 'USER' | 'VIEWER'): Promise<AdminUser> => {
    const { data } = await api.put<AdminUser>(`/admin/users/${id}/role`, { role });
    return data;
  },

  updateUserEnabled: async (id: number, enabled: boolean): Promise<AdminUser> => {
    const { data } = await api.put<AdminUser>(`/admin/users/${id}/enabled`, { enabled });
    return data;
  },

  getActivityLogs: async (userId?: number, limit?: number): Promise<ActivityLog[]> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (limit) params.append('limit', limit.toString());
    const { data } = await api.get<ActivityLog[]>(`/admin/logs?${params}`);
    return data;
  },
};

