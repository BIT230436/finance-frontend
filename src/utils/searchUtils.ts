import { Transaction } from '../types';

/**
 * Advanced search trong transactions
 */
export const searchTransactions = (
  transactions: Transaction[],
  query: string
): Transaction[] => {
  if (!query || query.trim() === '') return transactions;

  const searchTerm = query.toLowerCase().trim();

  return transactions.filter((t) => {
    // Search in amount
    const amountStr = t.amount.toString();
    if (amountStr.includes(searchTerm)) return true;

    // Search in note
    if (t.note && t.note.toLowerCase().includes(searchTerm)) return true;

    // Search in date
    if (t.occurredAt) {
      const date = new Date(t.occurredAt);
      if (!isNaN(date.getTime())) {
        const dateStr = date.toLocaleDateString('vi-VN');
        if (dateStr.includes(searchTerm)) return true;
      }
    }

    // Amount range search: "100k-500k" or "100000-500000"
    const rangeMatch = searchTerm.match(/(\d+(?:k|m)?)\s*-\s*(\d+(?:k|m)?)/i);
    if (rangeMatch) {
      const parseAmount = (str: string) => {
        const num = parseFloat(str);
        if (str.toLowerCase().endsWith('k')) return num * 1000;
        if (str.toLowerCase().endsWith('m')) return num * 1000000;
        return num;
      };
      const min = parseAmount(rangeMatch[1]);
      const max = parseAmount(rangeMatch[2]);
      if (t.amount >= min && t.amount <= max) return true;
    }

    return false;
  });
};

/**
 * Get recent search terms từ localStorage
 */
export const getRecentSearches = (): string[] => {
  try {
    const recent = localStorage.getItem('recentSearches');
    if (!recent) return [];
    const parsed = JSON.parse(recent);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
};

/**
 * Save search term to recent searches
 */
export const saveRecentSearch = (term: string): void => {
  if (!term || term.trim() === '') return;

  try {
    const recent = getRecentSearches();
    // Remove nếu đã có
    const filtered = recent.filter((s) => s.toLowerCase() !== term.toLowerCase());
    // Add to beginning
    const updated = [term.trim(), ...filtered].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch (error) {
    console.error('[SearchUtils] Error saving recent search:', error);
  }
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = (): void => {
  try {
    localStorage.removeItem('recentSearches');
  } catch (error) {
    console.error('[SearchUtils] Error clearing recent searches:', error);
  }
};

