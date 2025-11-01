import api from './api';

export interface BackupResponse {
  success: boolean;
  message: string;
  filename: string;
  size: number;
  timestamp: string;
}

export interface BackupStatus {
  lastBackup: string | null;
  filename: string | null;
  size: number;
  enabled: boolean;
}

export const backupService = {
  /**
   * Trigger database backup (ADMIN only)
   */
  triggerBackup: async (): Promise<BackupResponse> => {
    const { data } = await api.post<BackupResponse>('/backup/trigger');
    return data;
  },

  /**
   * Get backup status
   */
  getStatus: async (): Promise<BackupStatus> => {
    const { data } = await api.get<BackupStatus>('/backup/status');
    return data;
  },
};

