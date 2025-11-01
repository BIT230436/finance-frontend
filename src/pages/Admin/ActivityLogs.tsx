import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { adminService } from '../../services/adminService';
import Layout from '../../components/Layout/Layout';
import { ActivityLog } from '../../types';
import './Admin.css';

const ActivityLogs: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterUserId, setFilterUserId] = useState<number | ''>('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadLogs();
    }
  }, [user, filterUserId]);

  const loadLogs = async () => {
    if (user?.role !== 'ADMIN') return;
    
    setLoading(true);
    setError('');

    try {
      const data = await adminService.getActivityLogs(
        filterUserId ? filterUserId : undefined,
        100
      );
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải nhật ký hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: 'Tạo mới',
      UPDATE: 'Cập nhật',
      DELETE: 'Xóa',
      LOGIN: 'Đăng nhập',
      LOGOUT: 'Đăng xuất',
      PASSWORD_RESET: 'Đặt lại mật khẩu',
      ROLE_CHANGE: 'Thay đổi vai trò',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      LOGIN: '🔓',
      LOGOUT: '🔒',
      PASSWORD_RESET: '🔑',
      ROLE_CHANGE: '👤',
    };
    return icons[action] || '•';
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      <div className="admin-page">
        <div className="page-header">
          <h1>Nhật ký hoạt động</h1>
        </div>

        {/* Filter */}
        <div className="filter-section">
          <label>
            Lọc theo User ID:
            <input
              type="number"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Nhập User ID (để trống để xem tất cả)"
              className="filter-input"
            />
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && logs.length === 0 && (
          <div className="empty-state">
            <p>Không có nhật ký hoạt động nào.</p>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div className="logs-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>IP</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      {log.userName ? (
                        <>
                          {log.userName}
                          <br />
                          <small>(ID: {log.userId})</small>
                        </>
                      ) : (
                        `User ID: ${log.userId}`
                      )}
                    </td>
                    <td>
                      <span className="action-badge">
                        {getActionIcon(log.action)} {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td>{log.entity}</td>
                    <td>{log.entityId || '-'}</td>
                    <td>{log.ipAddress || '-'}</td>
                    <td>
                      <small>{log.userAgent ? log.userAgent.substring(0, 50) + '...' : '-'}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ActivityLogs;

