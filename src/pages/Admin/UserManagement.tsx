import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { adminService } from '../../services/adminService';
import Layout from '../../components/Layout/Layout';
import { AdminUser } from '../../types';
import './Admin.css';

const UserManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'ADMIN' | 'USER' | 'VIEWER') => {
    if (userId === user?.id) {
      alert('Bạn không thể thay đổi vai trò của chính mình');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn thay đổi vai trò thành ${newRole}?`)) {
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể thay đổi vai trò');
    }
  };

  const handleToggleEnabled = async (userId: number, currentEnabled: boolean) => {
    if (userId === user?.id) {
      alert('Bạn không thể vô hiệu hóa tài khoản của chính mình');
      return;
    }

    const action = currentEnabled ? 'khóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) {
      return;
    }

    try {
      await adminService.updateUserEnabled(userId, !currentEnabled);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadUsers();
    }
  }, [user]);

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Quản lý người dùng</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && users.length === 0 && (
          <div className="empty-state">
            <p>Không có người dùng nào.</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Họ và tên</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>2FA</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((adminUser) => (
                <tr key={adminUser.id}>
                  <td>{adminUser.id}</td>
                  <td>{adminUser.email}</td>
                  <td>{adminUser.fullName}</td>
                  <td>
                    <select
                      value={adminUser.role}
                      onChange={(e) =>
                        handleRoleChange(adminUser.id, e.target.value as 'ADMIN' | 'USER' | 'VIEWER')
                      }
                      disabled={adminUser.id === user?.id}
                      className="role-select"
                    >
                      <option value="ADMIN">Quản trị viên</option>
                      <option value="USER">Người dùng</option>
                      <option value="VIEWER">Người xem</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${adminUser.enabled ? 'enabled' : 'disabled'}`}>
                      {adminUser.enabled ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    {adminUser.twoFactorEnabled ? (
                      <span className="badge-success">✓ Bật</span>
                    ) : (
                      <span className="badge-gray">✗ Tắt</span>
                    )}
                  </td>
                  <td>
                    {adminUser.createdAt
                      ? new Date(adminUser.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleEnabled(adminUser.id, adminUser.enabled)}
                      className={`btn ${adminUser.enabled ? 'btn-warning' : 'btn-success'}`}
                      disabled={adminUser.id === user?.id}
                      style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                    >
                      {adminUser.enabled ? 'Khóa' : 'Kích hoạt'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default UserManagement;

