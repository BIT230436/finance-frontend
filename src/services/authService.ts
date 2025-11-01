import api from './api';
import { AuthResponse, TwoFactorResponse, User, PermissionsResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  register: async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      fullName,
    });
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  confirmPasswordReset: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  get2FAStatus: async (): Promise<{ enabled: boolean }> => {
    const { data } = await api.get<{ enabled: boolean }>('/auth/2fa/status');
    return data;
  },

  enable2FA: async (): Promise<TwoFactorResponse> => {
    const { data } = await api.post<TwoFactorResponse>('/auth/2fa/enable');
    return data;
  },

  verify2FASetup: async (code: string): Promise<void> => {
    await api.post('/auth/2fa/verify', { code });
  },

  disable2FA: async (password: string): Promise<void> => {
    await api.delete('/auth/2fa/disable', { data: { password } });
  },

  googleLogin: (): void => {
    // OAuth2 authorization endpoint doesn't have /api prefix
    const apiBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const baseURL = apiBaseURL.replace('/api', '');
    const oauth2URL = `${baseURL}/oauth2/authorization/google`;
    
    console.log('[authService] Redirecting to OAuth2:', oauth2URL);
    window.location.href = oauth2URL;
  },

  updateProfile: async (updates: { fullName?: string; email?: string; avatarUrl?: string }): Promise<User> => {
    // Only send non-empty fields (backend accepts optional fields)
    const payload: any = {};
    
    if (updates.fullName && updates.fullName.trim()) {
      payload.fullName = updates.fullName.trim();
    }
    
    if (updates.email && updates.email.trim()) {
      payload.email = updates.email.trim();
    }
    
    if (updates.avatarUrl) {
      payload.avatarUrl = updates.avatarUrl;
    }
    
    const { data } = await api.put<User>('/users/profile', payload);
    return data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ url: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },

  getLoginHistory: async (page: number = 0, size: number = 20): Promise<any> => {
    const { data } = await api.get('/users/login-history', {
      params: { page, size },
    });
    // Backend trả về Page format: { content: [...], totalElements, totalPages, ... }
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/users/change-password', { currentPassword, newPassword });
  },

  getPermissions: async (): Promise<PermissionsResponse> => {
    const { data } = await api.get<PermissionsResponse>('/auth/permissions');
    return data;
  },

  deleteAccount: async (password: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>('/users/account', {
      data: { password },
    });
    return data;
  },
};

