// User Types
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  enabled?: boolean;
  twoFactorEnabled?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

// Permissions Types
export interface UserPermissions {
  canManageUsers: boolean;
  canViewUsers: boolean;
  canCreateWallets: boolean;
  canUpdateWallets: boolean;
  canDeleteWallets: boolean;
  canViewWallets: boolean;
  canCreateTransactions: boolean;
  canUpdateTransactions: boolean;
  canDeleteTransactions: boolean;
  canViewTransactions: boolean;
  canCreateCategories: boolean;
  canUpdateCategories: boolean;
  canDeleteCategories: boolean;
  canViewCategories: boolean;
  canCreateBudgets: boolean;
  canUpdateBudgets: boolean;
  canDeleteBudgets: boolean;
  canViewBudgets: boolean;
  canCreateGoals: boolean;
  canUpdateGoals: boolean;
  canDeleteGoals: boolean;
  canViewGoals: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canManageRecurringTransactions: boolean;
  canShareWallets: boolean;
  canSendFeedback: boolean;
}

export interface PermissionsResponse {
  role: string;
  userId: number;
  email: string;
  fullName: string;
  features: UserPermissions;
}

// Wallet Types
export interface Wallet {
  id: number;
  name: string;
  type: 'CASH' | 'BANK' | 'E_WALLET';
  currency: string;
  balance: number;
  isDefault: boolean;
  createdAt?: string;
}

export interface WalletDto {
  name: string;
  type: 'CASH' | 'BANK' | 'E_WALLET';
  currency: string;
  balance: number;
  isDefault: boolean;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
}

export interface CategoryDto {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
}

// Transaction Types
export interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  walletId: number;
  categoryId: number;
  note?: string;
  occurredAt: string;
  attachmentUrl?: string;
}

export interface TransactionDto {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  walletId: number;
  categoryId: number;
  note?: string;
  occurredAt?: string;
  attachmentUrl?: string | null;
}

export interface TransferRequest {
  fromWalletId: number;
  toWalletId: number;
  amount: number;
}

// Budget Types
export interface Budget {
  id: number;
  categoryId: number;
  period: 'MONTHLY' | 'WEEKLY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  limitAmount: number;
  usedAmount: number;
  alertThreshold: number;
}

export interface BudgetDto {
  categoryId: number;
  period: 'MONTHLY' | 'WEEKLY' | 'CUSTOM';
  startDate: string;
  endDate: string;
  limitAmount: number;
  alertThreshold?: number;
}

// Report Types
export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categorySummaries: CategorySummary[];
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  amount: number;
  type: string;
}

export interface CashflowDto {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

// Error Types
export interface ApiError {
  timestamp: string;
  status: number;
  errorCode: string;
  message: string;
  path: string;
  details?: Record<string, string>;
}

// 2FA Types
export interface TwoFactorResponse {
  secret: string;
  qrCodeUrl: string;
  enabled: boolean;
  message?: string;
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  message: string;
}

// Recurring Transaction Types
export interface RecurringTransaction {
  id: number;
  userId: number;
  walletId: number;
  categoryId: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  active: boolean;
  note?: string;
}

export interface RecurringTransactionDto {
  walletId: number;
  categoryId: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  note?: string;
}

// Financial Goal Types
export interface FinancialGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  walletId: number;
  description?: string;
  createdAt?: string;
}

export interface FinancialGoalDto {
  name: string;
  targetAmount: number;
  targetDate: string;
  walletId: number;
  description?: string;
}

// Shared Wallet Types
export interface SharedWallet {
  id: number;
  walletId: number;
  walletName: string;
  ownerId: number;
  ownerName: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  permission: 'READ_ONLY' | 'EDIT';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt?: string;
}

export interface SharedWalletInvitation {
  walletId: number;
  memberEmail: string;
  permission: 'READ_ONLY' | 'EDIT';
}

export interface SharedWalletMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  permission: 'READ_ONLY' | 'EDIT';
  joinedAt: string;
}

// Admin Types
export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  enabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  userName?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_RESET' | 'ROLE_CHANGE';
  entity: string;
  entityId?: number;
  metadata?: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// Achievement Types
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface UserAchievement {
  id: number;
  achievementId: number;
  achievement: Achievement;
  unlockedAt: string;
}

export interface AchievementResponse {
  unlocked: UserAchievement[];
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
}

// Financial Health Score Types
export interface HealthScoreComponent {
  score: number;
  weight: string;
}

export interface FinancialHealthScore {
  score: number;
  healthLevel: string;
  healthColor: string;
  components: {
    budgetAdherence: HealthScoreComponent;
    savingsRate: HealthScoreComponent;
    netWorthGrowth: HealthScoreComponent;
    consistency: HealthScoreComponent;
  };
  recommendations: string[];
  calculatedAt: string;
}

// Cashflow Forecast Types
export interface DailyForecast {
  date: string;
  expectedIncome: number;
  expectedExpense: number;
  netChange: number;
  predictedBalance: number;
  zone: 'GREEN' | 'YELLOW' | 'RED';
}

export interface CashflowForecast {
  currentBalance: number;
  forecastDays: number;
  dailyForecast: DailyForecast[];
  minPredictedBalance: number;
  warningDays: string[];
  hasWarnings: boolean;
  avgDailySpending: number;
}

// Comparative Analysis Types
export interface PeriodData {
  income: number;
  expense: number;
  net: number;
  categoryBreakdown?: CategorySummary[];
}

export interface VarianceData {
  absolute: number;
  percentage: number;
  direction: 'increase' | 'decrease' | 'unchanged';
}

export interface Variance {
  income: VarianceData;
  expense: VarianceData;
  net: VarianceData;
}

export interface ComparativeAnalysisResponse {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  variance: Variance;
  insights: string[];
}

// Expense Splitting Types
export interface SplitExpenseParticipant {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
}

export interface SplitExpense {
  id: number;
  description: string;
  totalAmount: number;
  creatorId: number;
  creatorName: string;
  participants: SplitExpenseParticipant[];
  status: 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';
  createdAt: string;
}

export interface SplitExpenseDto {
  description: string;
  totalAmount: number;
  participantUserIds: number[];
  customAmounts?: { [key: number]: number };
}

export interface PendingSplitPayment {
  splitExpenseId: number;
  description: string;
  totalAmount: number;
  yourShare: number;
  createdBy: string;
  createdAt: string;
}

// Quick Entry Types
export interface QuickEntryDefaults {
  defaultWallet: Wallet | null;
  recentCategories: Category[];
}

export interface SuperQuickEntryDto {
  amount: number;
  categoryId: number;
}

export interface VoiceEntryDto {
  text: string;
}

export interface BatchEntryResponse {
  successCount: number;
  errorCount: number;
  errors: string[];
}

