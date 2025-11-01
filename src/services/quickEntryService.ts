import api from './api';
import { QuickEntryDefaults, SuperQuickEntryDto, VoiceEntryDto, BatchEntryResponse, Transaction } from '../types';

export const quickEntryService = {
  /**
   * Get quick entry defaults (default wallet + recent categories)
   * Cache this for 1 hour
   */
  getDefaults: async (): Promise<QuickEntryDefaults> => {
    const { data } = await api.get<QuickEntryDefaults>('/quick-entry/defaults');
    return data;
  },

  /**
   * Super quick entry - only amount and categoryId
   * Auto-fills wallet, type, and date
   */
  superQuickAdd: async (entry: SuperQuickEntryDto): Promise<Transaction> => {
    const { data } = await api.post<Transaction>('/quick-entry/super-quick', entry);
    return data;
  },

  /**
   * Voice entry - parse text into transaction
   * Framework ready for NLP integration
   */
  voiceEntry: async (voice: VoiceEntryDto): Promise<Transaction> => {
    const { data } = await api.post<Transaction>('/quick-entry/voice', voice);
    return data;
  },

  /**
   * Batch entry - add multiple transactions at once
   */
  batchAdd: async (entries: SuperQuickEntryDto[]): Promise<BatchEntryResponse> => {
    const { data } = await api.post<BatchEntryResponse>('/quick-entry/batch', entries);
    return data;
  },
};

