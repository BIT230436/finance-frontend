import api from './api';
import { ReportSummary, CashflowDto } from '../types';

export const reportService = {
  getSummary: async (from?: Date, to?: Date): Promise<ReportSummary> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const queryString = params.toString();
    const url = queryString ? `/reports/summary?${queryString}` : '/reports/summary';
    
    console.log('[ReportService] Fetching summary:', { url, from, to });
    try {
      const { data } = await api.get<ReportSummary>(url);
      console.log('[ReportService] Summary data received:', data);
      return data;
    } catch (error: any) {
      console.error('[ReportService] Error fetching summary:', error);
      throw error;
    }
  },

  getCashflow: async (from?: Date, to?: Date): Promise<CashflowDto[]> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const queryString = params.toString();
    const url = queryString ? `/reports/cashflow?${queryString}` : '/reports/cashflow';
    
    console.log('[ReportService] Fetching cashflow:', { url, from, to });
    try {
      const { data } = await api.get<CashflowDto[]>(url);
      console.log('[ReportService] Cashflow data received:', data);
      return data;
    } catch (error: any) {
      console.error('[ReportService] Error fetching cashflow:', error);
      throw error;
    }
  },

  exportExcel: (from?: Date, to?: Date): void => {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const queryString = params.toString();
    const url = queryString ? `${baseURL}/export/excel?${queryString}` : `${baseURL}/export/excel`;
    window.open(url);
  },

  exportPdf: (from?: Date, to?: Date): void => {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const queryString = params.toString();
    const url = queryString ? `${baseURL}/export/pdf?${queryString}` : `${baseURL}/export/pdf`;
    window.open(url);
  },
};

