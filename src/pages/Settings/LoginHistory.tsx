import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { authService } from '../../services/authService';
import Layout from '../../components/Layout/Layout';
import './LoginHistory.css';

interface LoginHistoryEntry {
  id: number;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  device?: string;
  location?: string;
  success: boolean;
}

const LoginHistory: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLoginHistory = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      console.log('[LoginHistory] Loading login history...');
      const response = await authService.getLoginHistory();
      console.log('[LoginHistory] Data received:', response);
      
      // Backend trả về Page format: { content: [...], totalElements, totalPages, ... }
      // Hoặc có thể là array trực tiếp
      const data = Array.isArray(response) ? response : (response.content || response);
      
      // Map backend response to frontend format
      const mappedHistory = data.map((entry: any) => ({
        id: entry.id,
        loginTime: entry.loginTime || entry.createdAt || entry.timestamp,
        ipAddress: entry.ipAddress || entry.ip || 'Unknown',
        userAgent: entry.userAgent || entry.deviceInfo || 'Unknown',
        device: entry.device || getDeviceInfo(entry.userAgent || entry.deviceInfo || ''),
        location: entry.location || null,
        success: entry.action === 'LOGIN' || entry.success !== false, // Default to true if LOGIN action
      }));
      
      setHistory(mappedHistory);
    } catch (err: any) {
      console.error('[LoginHistory] Error:', err);
      setError(err.response?.data?.message || 'Không thể tải lịch sử đăng nhập');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadLoginHistory();
  }, [loadLoginHistory]);

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'iOS';
    }
    if (userAgent.includes('Android')) {
      return 'Android';
    }
    if (userAgent.includes('Windows')) {
      return 'Windows';
    }
    if (userAgent.includes('Mac')) {
      return 'macOS';
    }
    if (userAgent.includes('Linux')) {
      return 'Linux';
    }
    return 'Unknown';
  };

  return (
    <Layout>
      <div className="login-history">
        <div className="page-header">
          <Link to="/settings" className="back-link">
            ← Quay lại Cài đặt
          </Link>
          <h1>Nhật ký đăng nhập</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && history.length === 0 && (
          <div className="empty-state">
            <p>Chưa có lịch sử đăng nhập nào.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className={`history-item ${entry.success ? 'success' : 'failed'}`}>
                <div className="history-icon">
                  {entry.success ? '✓' : '✗'}
                </div>
                <div className="history-content">
                  <div className="history-main">
                    <div className="history-time">
                      {new Date(entry.loginTime).toLocaleString('vi-VN')}
                    </div>
                    <div className="history-status">
                      {entry.success ? (
                        <span className="status-success">Đăng nhập thành công</span>
                      ) : (
                        <span className="status-failed">Đăng nhập thất bại</span>
                      )}
                    </div>
                  </div>
                  <div className="history-details">
                    <div className="detail-item">
                      <span className="detail-label">Thiết bị:</span>
                      <span className="detail-value">{entry.device || getDeviceInfo(entry.userAgent)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">IP:</span>
                      <span className="detail-value">{entry.ipAddress}</span>
                    </div>
                    {entry.location && (
                      <div className="detail-item">
                        <span className="detail-label">Vị trí:</span>
                        <span className="detail-value">{entry.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoginHistory;

