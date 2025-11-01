import api from './api';
import { CashflowForecast } from '../types';

export const cashflowForecastService = {
  /**
   * Get cashflow forecast for next N days (default 30)
   */
  getForecast: async (days: number = 30): Promise<CashflowForecast> => {
    const { data } = await api.get<CashflowForecast>(`/cashflow-forecast?days=${days}`);
    return data;
  },
};

