import { User, UserPermissions } from '../types';

/**
 * Utility functions để check permissions
 * 
 * Ưu tiên sử dụng permissions từ API (backend-driven permissions)
 * Nếu không có permissions, fallback về role-based check
 */

/**
 * Check permission từ permissions object (backend-driven)
 * Fallback về role-based check nếu permissions chưa được load
 */
export const canCreate = (permissions: UserPermissions | null, user: User | null): boolean => {
  if (permissions) {
    // Backend-driven permissions - ưu tiên
    return permissions.canCreateWallets || permissions.canCreateTransactions || 
           permissions.canCreateCategories || permissions.canCreateBudgets || 
           permissions.canCreateGoals;
  }
  // Fallback to role-based check
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'USER';
};

export const canUpdate = (permissions: UserPermissions | null, user: User | null): boolean => {
  if (permissions) {
    // Backend-driven permissions - ưu tiên
    return permissions.canUpdateWallets || permissions.canUpdateTransactions || 
           permissions.canUpdateCategories || permissions.canUpdateBudgets || 
           permissions.canUpdateGoals;
  }
  // Fallback to role-based check
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'USER';
};

export const canDelete = (permissions: UserPermissions | null, user: User | null): boolean => {
  if (permissions) {
    // Backend-driven permissions - ưu tiên
    return permissions.canDeleteWallets || permissions.canDeleteTransactions || 
           permissions.canDeleteCategories || permissions.canDeleteBudgets || 
           permissions.canDeleteGoals;
  }
  // Fallback to role-based check
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'USER';
};

export const canManage = (permissions: UserPermissions | null, user: User | null): boolean => {
  if (permissions) {
    // Backend-driven permissions - ưu tiên
    return permissions.canCreateWallets || permissions.canCreateTransactions || 
           permissions.canCreateCategories || permissions.canCreateBudgets || 
           permissions.canCreateGoals || permissions.canShareWallets || 
           permissions.canManageRecurringTransactions;
  }
  // Fallback to role-based check
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'USER';
};

export const canViewAdmin = (permissions: UserPermissions | null, user: User | null): boolean => {
  if (permissions) {
    // Backend-driven permissions - ưu tiên
    return permissions.canManageUsers || permissions.canViewUsers;
  }
  // Fallback to role-based check
  if (!user) return false;
  return user.role === 'ADMIN';
};

export const isReadOnly = (permissions: UserPermissions | null, user: User | null): boolean => {
  if (permissions) {
    // Backend-driven permissions - ưu tiên
    // Nếu không có quyền create/update/delete nào → read-only
    return !permissions.canCreateWallets && !permissions.canUpdateWallets && 
           !permissions.canDeleteWallets && !permissions.canCreateTransactions && 
           !permissions.canUpdateTransactions && !permissions.canDeleteTransactions;
  }
  // Fallback to role-based check
  if (!user) return true;
  return user.role === 'VIEWER';
};

// Specific permission checks (use these for granular control)
// NOTE: These need user parameter for fallback to role-based check
export const canCreateWallets = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canCreateWallets;
  // Fallback: ADMIN and USER can create
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canUpdateWallets = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canUpdateWallets;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canDeleteWallets = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canDeleteWallets;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canCreateTransactions = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canCreateTransactions;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canUpdateTransactions = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canUpdateTransactions;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canDeleteTransactions = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canDeleteTransactions;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canCreateCategories = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canCreateCategories;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canUpdateCategories = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canUpdateCategories;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canDeleteCategories = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canDeleteCategories;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canCreateBudgets = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canCreateBudgets;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canUpdateBudgets = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canUpdateBudgets;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canDeleteBudgets = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canDeleteBudgets;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canCreateGoals = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canCreateGoals;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canUpdateGoals = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canUpdateGoals;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canDeleteGoals = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canDeleteGoals;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canShareWallets = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canShareWallets;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canManageRecurringTransactions = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canManageRecurringTransactions;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canSendFeedback = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canSendFeedback;
  return true; // All roles can send feedback by default
};

export const canExportData = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canExportData;
  return user?.role === 'ADMIN' || user?.role === 'USER';
};

export const canManageUsers = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canManageUsers;
  return user?.role === 'ADMIN'; // Only ADMIN can manage users
};

export const canViewUsers = (permissions: UserPermissions | null, user: User | null = null): boolean => {
  if (permissions !== null) return permissions.canViewUsers;
  return user?.role === 'ADMIN';
};

