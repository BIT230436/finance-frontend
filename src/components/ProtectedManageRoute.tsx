import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedManageRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute cho các tính năng quản lý
 * Chỉ ADMIN và USER có thể truy cập
 * VIEWER bị chặn và redirect về dashboard
 */
const ProtectedManageRoute: React.FC<ProtectedManageRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { canManage } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canManage()) {
    // VIEWER không có quyền quản lý → redirect về dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedManageRoute;

