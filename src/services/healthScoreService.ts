import api from './api';
import { FinancialHealthScore } from '../types';

export const healthScoreService = {
  /**
   * Get financial health score (0-100) with components breakdown
   */
  getHealthScore: async (): Promise<FinancialHealthScore> => {
    const { data } = await api.get<FinancialHealthScore>('/financial-health/score');
    return data;
  },
};

