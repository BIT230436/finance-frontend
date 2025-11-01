import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { notificationService, Notification } from '../../services/notificationService';
import NotificationToast from './NotificationToast';
import './NotificationCenter.css';

const NotificationCenter: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-update unread count every 10 seconds
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('[NotificationCenter] Failed to fetch unread count:', err);
      }
    };

    fetchUnreadCount(); // Initial fetch
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('[NotificationCenter] Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[NotificationCenter] Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationCenter] Failed to mark all as read:', err);
    }
  };

  const handleToggleDropdown = () => {
    const newState = !showDropdown;
    setShowDropdown(newState);
    
    // Fetch notifications when opening dropdown
    if (newState && user?.id) {
      fetchNotifications();
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <>
      <div className="notification-center">
        <button
          onClick={handleToggleDropdown}
          className="notification-icon"
        >
          🔔
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>

        {showDropdown && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Thông báo</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="btn-link">
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">
                  <p>Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <h4>{notification.title}</h4>
                        {!notification.read && <span className="unread-dot"></span>}
                      </div>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationCenter;

