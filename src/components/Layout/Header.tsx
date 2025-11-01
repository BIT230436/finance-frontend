import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { clearPermissions } from '../../store/slices/permissionsSlice';
import NotificationCenter from '../Notifications/NotificationCenter';
import { usePermissions } from '../../hooks/usePermissions';
import './Layout.css';

const Header: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { canManage, canViewAdmin } = usePermissions();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearPermissions());
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="logo">
          Ứng dụng Quản lý Tài chính
        </Link>
        <nav className="nav">
          {/* Tất cả roles đều có thể xem */}
          <Link to="/dashboard">Bảng điều khiển</Link>
          <Link to="/wallets">Ví</Link>
          <Link to="/transactions">Giao dịch</Link>
          <Link to="/reports">Báo cáo</Link>
          
          {/* Chỉ ADMIN và USER có thể quản lý */}
              {canManage() && (
                <>
                  <Link to="/goals">Mục tiêu</Link>
                  <Link to="/recurring-transactions">Giao dịch định kỳ</Link>
                  <Link to="/categories">Thể loại</Link>
                  <Link to="/budgets">Ngân sách</Link>
                  <Link to="/wallets/shared">Ví chia sẻ</Link>
                  <Link to="/expense-split">Chia Bill</Link>
                  <Link to="/settings">Cài đặt</Link>
                  <Link to="/feedback">Phản hồi</Link>
                </>
              )}
          
          {/* Chỉ ADMIN có thể truy cập Admin panel */}
          {canViewAdmin() && (
            <>
              <Link to="/admin/users">Quản lý người dùng</Link>
              <Link to="/admin/logs">Nhật ký hệ thống</Link>
            </>
          )}
        </nav>
        <div className="user-section">
          <NotificationCenter />
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="user-avatar"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
            />
          ) : (
            <div className="user-avatar">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <span className="user-name">{user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

