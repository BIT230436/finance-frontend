import api from './api';
import { ComparativeAnalysisResponse } from '../types';

export const comparativeAnalysisService = {
  /**
   * Compare current month vs previous month
   */
  getMonthOverMonth: async (): Promise<ComparativeAnalysisResponse> => {
    const { data } = await api.get<ComparativeAnalysisResponse>('/comparative-analysis/month-over-month');
    return data;
  },

  /**
   * Compare current month vs 3-month average
   */
  getVsAverage: async (): Promise<ComparativeAnalysisResponse> => {
    const { data } = await api.get<ComparativeAnalysisResponse>('/comparative-analysis/vs-average');
    return data;
  },

  /**
   * Compare current year vs previous year
   */
  getYearOverYear: async (): Promise<ComparativeAnalysisResponse> => {
    const { data } = await api.get<ComparativeAnalysisResponse>('/comparative-analysis/year-over-year');
    return data;
  },
};

