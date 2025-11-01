import { Transaction, Category } from '../types';

/**
 * Smart category suggestions dựa trên transaction history
 */
export const getCategorySuggestions = (
  transactions: Transaction[],
  categories: Category[],
  type: 'INCOME' | 'EXPENSE',
  amount?: number,
  note?: string,
  walletId?: number
): Category[] => {
  if (transactions.length === 0) return [];

  // Filter transactions by type
  const typeTransactions = transactions.filter((t) => t.type === type);

  if (typeTransactions.length === 0) return [];

  // 1. Most frequently used categories
  const categoryUsage = new Map<number, number>();
  typeTransactions.forEach((t) => {
    const count = categoryUsage.get(t.categoryId) || 0;
    categoryUsage.set(t.categoryId, count + 1);
  });

  // 2. Recent categories (last 10 transactions)
  const recentTransactions = typeTransactions
    .filter((t) => t.occurredAt)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 10);

  const recentCategories = new Map<number, number>();
  recentTransactions.forEach((t) => {
    const count = recentCategories.get(t.categoryId) || 0;
    recentCategories.set(t.categoryId, count + 1);
  });

  // 3. Keyword matching (nếu có note)
  const keywordMatches = new Map<number, number>();
  if (note && note.trim()) {
    const keywords = note.toLowerCase().split(/\s+/);
    typeTransactions.forEach((t) => {
      if (t.note) {
        const noteLower = t.note.toLowerCase();
        const matchCount = keywords.filter((kw) => noteLower.includes(kw)).length;
        if (matchCount > 0) {
          const score = keywordMatches.get(t.categoryId) || 0;
          keywordMatches.set(t.categoryId, score + matchCount);
        }
      }
    });
  }

  // 4. Amount-based matching (similar amounts)
  const amountMatches = new Map<number, number>();
  if (amount && amount > 0) {
    typeTransactions.forEach((t) => {
      const diff = Math.abs(t.amount - amount);
      const percentageDiff = diff / amount;
      // Nếu chênh lệch < 20%, cho điểm
      if (percentageDiff < 0.2) {
        const score = amountMatches.get(t.categoryId) || 0;
        amountMatches.set(t.categoryId, score + (1 - percentageDiff));
      }
    });
  }

  // 5. Wallet-based matching
  const walletMatches = new Map<number, number>();
  if (walletId) {
    typeTransactions
      .filter((t) => t.walletId === walletId)
      .forEach((t) => {
        const count = walletMatches.get(t.categoryId) || 0;
        walletMatches.set(t.categoryId, count + 1);
      });
  }

  // Calculate total score for each category
  const categoryScores = new Map<number, number>();
  
  categoryUsage.forEach((count, categoryId) => {
    const score = (count / typeTransactions.length) * 30; // 30% weight
    categoryScores.set(categoryId, score);
  });

  recentCategories.forEach((count, categoryId) => {
    const score = (count / recentTransactions.length) * 30; // 30% weight
    const current = categoryScores.get(categoryId) || 0;
    categoryScores.set(categoryId, current + score);
  });

  keywordMatches.forEach((score, categoryId) => {
    const current = categoryScores.get(categoryId) || 0;
    categoryScores.set(categoryId, current + score * 20); // 20% weight
  });

  amountMatches.forEach((score, categoryId) => {
    const current = categoryScores.get(categoryId) || 0;
    categoryScores.set(categoryId, current + score * 10); // 10% weight
  });

  walletMatches.forEach((count, categoryId) => {
    const score = (count / typeTransactions.filter((t) => t.walletId === walletId).length) * 10; // 10% weight
    const current = categoryScores.get(categoryId) || 0;
    categoryScores.set(categoryId, current + score);
  });

  // Get top 3 categories by score
  const sortedCategories = Array.from(categoryScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryId]) => categories.find((c) => c.id === categoryId && c.type === type))
    .filter((c): c is Category => c !== undefined);

  return sortedCategories;
};

/**
 * Detect duplicate transactions
 */
export const detectDuplicateTransaction = (
  transactions: Transaction[],
  newTransaction: {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId: number;
    walletId: number;
    occurredAt?: string;
    note?: string;
  },
  timeWindowHours: number = 1
): Transaction | null => {
  if (!newTransaction.occurredAt) return null;

  const newDate = new Date(newTransaction.occurredAt);
  if (isNaN(newDate.getTime())) return null;

  // Check for exact duplicates (same amount + date + category + wallet)
  const exactMatch = transactions.find(
    (t) =>
      Math.abs(t.amount - newTransaction.amount) < 0.01 &&
      t.categoryId === newTransaction.categoryId &&
      t.walletId === newTransaction.walletId &&
      t.type === newTransaction.type &&
      t.occurredAt
  );

  if (exactMatch) {
    const existingDate = new Date(exactMatch.occurredAt);
    const timeDiff = Math.abs(newDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60); // hours
    
    // Nếu trùng hoàn toàn hoặc trong time window
    if (timeDiff < timeWindowHours) {
      return exactMatch;
    }
  }

  // Check for similar transactions (same amount ± 1%, same category, within time window)
  const similarMatch = transactions.find((t) => {
    if (t.categoryId !== newTransaction.categoryId || t.walletId !== newTransaction.walletId || t.type !== newTransaction.type) {
      return false;
    }

    if (!t.occurredAt) return false;

    const existingDate = new Date(t.occurredAt);
    const timeDiff = Math.abs(newDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60);
    
    if (timeDiff > timeWindowHours) return false;

    const amountDiff = Math.abs(t.amount - newTransaction.amount) / newTransaction.amount;
    return amountDiff < 0.01; // Chênh lệch < 1%
  });

  return similarMatch || null;
};

/**
 * Get average amount for a category
 */
export const getAverageAmountForCategory = (
  transactions: Transaction[],
  categoryId: number,
  type: 'INCOME' | 'EXPENSE'
): number | null => {
  const categoryTransactions = transactions.filter(
    (t) => t.categoryId === categoryId && t.type === type
  );

  if (categoryTransactions.length === 0) return null;

  const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  return total / categoryTransactions.length;
};

/**
 * Get most common amount for a category (rounded to nearest common value)
 */
export const getCommonAmountForCategory = (
  transactions: Transaction[],
  categoryId: number,
  type: 'INCOME' | 'EXPENSE'
): number[] => {
  const categoryTransactions = transactions.filter(
    (t) => t.categoryId === categoryId && t.type === type
  );

  if (categoryTransactions.length === 0) return [];

  // Group by rounded amounts
  const amountGroups = new Map<number, number>();
  categoryTransactions.forEach((t) => {
    // Round to nearest 5k
    const rounded = Math.round(t.amount / 5000) * 5000;
    const count = amountGroups.get(rounded) || 0;
    amountGroups.set(rounded, count + 1);
  });

  // Get top 3 most common amounts
  return Array.from(amountGroups.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([amount]) => amount);
};

