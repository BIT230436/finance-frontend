import { useAppSelector } from '../store/hooks';
import { UserPermissions } from '../types';
import * as permissionUtils from '../utils/permissions';

/**
 * Custom hook để dễ dàng sử dụng permissions trong components
 * 
 * Usage:
 * ```tsx
 * const { permissions, user, canCreate, canUpdate, canDelete } = usePermissions();
 * 
 * {canCreate() && <Button>Create</Button>}
 * {canUpdate() && <Button>Edit</Button>}
 * {canDelete() && <Button>Delete</Button>}
 * ```
 */
export const usePermissions = () => {
  const { permissions } = useAppSelector((state) => state.permissions);
  const { user } = useAppSelector((state) => state.auth);

  return {
    permissions: permissions as UserPermissions | null,
    user,
    // Helper functions with permissions and user pre-filled
    canCreate: () => permissionUtils.canCreate(permissions, user),
    canUpdate: () => permissionUtils.canUpdate(permissions, user),
    canDelete: () => permissionUtils.canDelete(permissions, user),
    canManage: () => permissionUtils.canManage(permissions, user),
    canViewAdmin: () => permissionUtils.canViewAdmin(permissions, user),
    isReadOnly: () => permissionUtils.isReadOnly(permissions, user),
    // Specific permission checks - pass user for fallback
    canCreateWallets: () => permissionUtils.canCreateWallets(permissions, user),
    canUpdateWallets: () => permissionUtils.canUpdateWallets(permissions, user),
    canDeleteWallets: () => permissionUtils.canDeleteWallets(permissions, user),
    canCreateTransactions: () => permissionUtils.canCreateTransactions(permissions, user),
    canUpdateTransactions: () => permissionUtils.canUpdateTransactions(permissions, user),
    canDeleteTransactions: () => permissionUtils.canDeleteTransactions(permissions, user),
    canCreateCategories: () => permissionUtils.canCreateCategories(permissions, user),
    canUpdateCategories: () => permissionUtils.canUpdateCategories(permissions, user),
    canDeleteCategories: () => permissionUtils.canDeleteCategories(permissions, user),
    canCreateBudgets: () => permissionUtils.canCreateBudgets(permissions, user),
    canUpdateBudgets: () => permissionUtils.canUpdateBudgets(permissions, user),
    canDeleteBudgets: () => permissionUtils.canDeleteBudgets(permissions, user),
    canCreateGoals: () => permissionUtils.canCreateGoals(permissions, user),
    canUpdateGoals: () => permissionUtils.canUpdateGoals(permissions, user),
    canDeleteGoals: () => permissionUtils.canDeleteGoals(permissions, user),
    canShareWallets: () => permissionUtils.canShareWallets(permissions, user),
    canManageRecurringTransactions: () => permissionUtils.canManageRecurringTransactions(permissions, user),
    canSendFeedback: () => permissionUtils.canSendFeedback(permissions, user),
    canExportData: () => permissionUtils.canExportData(permissions, user),
    canManageUsers: () => permissionUtils.canManageUsers(permissions, user),
    canViewUsers: () => permissionUtils.canViewUsers(permissions, user),
  };
};

