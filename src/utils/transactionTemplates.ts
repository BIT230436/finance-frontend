import { TransactionDto } from '../types';

export interface TransactionTemplate {
  id: string;
  name: string;
  transaction: TransactionDto;
  createdAt: string;
  usageCount: number;
}

const TEMPLATES_STORAGE_KEY = 'transactionTemplates';

/**
 * Get all saved transaction templates
 */
export const getTransactionTemplates = (): TransactionTemplate[] => {
  try {
    const templates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!templates) return [];
    const parsed = JSON.parse(templates);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Save a transaction template
 */
export const saveTransactionTemplate = (
  name: string,
  transaction: TransactionDto
): void => {
  try {
    const templates = getTransactionTemplates();
    const newTemplate: TransactionTemplate = {
      id: `template_${Date.now()}`,
      name: name.trim(),
      transaction,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    
    // Check if template with same name exists
    const existingIndex = templates.findIndex(
      (t) => t.name.toLowerCase() === newTemplate.name.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing
      templates[existingIndex] = { ...newTemplate, id: templates[existingIndex].id };
    } else {
      // Add new
      templates.push(newTemplate);
    }
    
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('[TransactionTemplates] Error saving template:', error);
  }
};

/**
 * Delete a transaction template
 */
export const deleteTransactionTemplate = (id: string): void => {
  try {
    const templates = getTransactionTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[TransactionTemplates] Error deleting template:', error);
  }
};

/**
 * Get suggested template name từ transaction
 */
export const suggestTemplateName = (transaction: TransactionDto, categories: any[]): string => {
  const category = categories.find((c) => c.id === transaction.categoryId);
  const categoryName = category?.name || '';
  
  if (transaction.note) {
    return `${categoryName} - ${transaction.note}`;
  }
  
  // Round amount to nearest common value
  const rounded = Math.round(transaction.amount / 1000) * 1000;
  return `${categoryName} - ${rounded.toLocaleString()} VND`;
};

/**
 * Increment usage count khi sử dụng template
 */
export const incrementTemplateUsage = (id: string): void => {
  try {
    const templates = getTransactionTemplates();
    const template = templates.find((t) => t.id === id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    }
  } catch (error) {
    console.error('[TransactionTemplates] Error incrementing usage:', error);
  }
};

