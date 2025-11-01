import api from './api';

export interface TransactionTemplate {
  id: number;
  name: string;
  walletId: number;
  categoryId: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  note?: string;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

export interface TransactionTemplateDto {
  name: string;
  walletId: number;
  categoryId: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  note?: string;
}

export const transactionTemplateService = {
  getAll: async (): Promise<TransactionTemplate[]> => {
    const { data } = await api.get<TransactionTemplate[]>('/transaction-templates');
    return data;
  },

  getById: async (id: number): Promise<TransactionTemplate> => {
    const { data } = await api.get<TransactionTemplate>(`/transaction-templates/${id}`);
    return data;
  },

  create: async (template: TransactionTemplateDto): Promise<TransactionTemplate> => {
    console.log('[TransactionTemplateService] Creating template:', template);
    const { data } = await api.post<TransactionTemplate>('/transaction-templates', template);
    console.log('[TransactionTemplateService] Create success:', data);
    return data;
  },

  update: async (id: number, template: Partial<TransactionTemplateDto>): Promise<TransactionTemplate> => {
    const { data } = await api.put<TransactionTemplate>(`/transaction-templates/${id}`, template);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transaction-templates/${id}`);
  },

  createTransactionFromTemplate: async (templateId: number): Promise<any> => {
    console.log('[TransactionTemplateService] Creating transaction from template:', templateId);
    const { data } = await api.post(`/transaction-templates/${templateId}/create-transaction`);
    console.log('[TransactionTemplateService] Create transaction from template success:', data);
    return data;
  },
};

