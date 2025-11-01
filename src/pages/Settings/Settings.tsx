import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setUser, logout } from '../../store/slices/authSlice';
import { clearPermissions } from '../../store/slices/permissionsSlice';
import { authService } from '../../services/authService';
import { backupService } from '../../services/backupService';
import { usePermissions } from '../../hooks/usePermissions';
import Layout from '../../components/Layout/Layout';
import './Settings.css';

const Settings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { canViewAdmin } = usePermissions();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      alert('Đổi mật khẩu thành công!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể đổi mật khẩu';
      setPasswordError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setFullName(user?.fullName || '');
    setAvatarPreview(user?.avatarUrl || null);
    setAvatarFile(null);
    setShowEditProfile(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('File ảnh không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setProfileError('Chỉ chấp nhận file ảnh');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProfileError('');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validate fullName
    const trimmedFullName = fullName.trim();
    if (trimmedFullName.length < 2) {
      setProfileError('Họ tên phải có ít nhất 2 ký tự');
      return;
    }

    setProfileLoading(true);
    setProfileError('');

    try {
      let avatarUrl = user.avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        const uploadResult = await authService.uploadAvatar(avatarFile);
        avatarUrl = uploadResult.url;
      }

      // Update profile (only send changed fields)
      const updates: { fullName?: string; avatarUrl?: string } = {};
      
      if (trimmedFullName !== user.fullName) {
        updates.fullName = trimmedFullName;
      }
      
      if (avatarUrl && avatarUrl !== user.avatarUrl) {
        updates.avatarUrl = avatarUrl;
      }

      // Only call API if there are changes
      if (Object.keys(updates).length > 0) {
        const updatedUser = await authService.updateProfile(updates);
        dispatch(setUser(updatedUser));
        alert('Cập nhật thông tin thành công!');
      } else {
        alert('Không có thay đổi nào');
      }
      
      setShowEditProfile(false);
    } catch (err: any) {
      console.error('[Settings] Update profile error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật thông tin';
      setProfileError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!user?.id) return;
    if (!window.confirm('Bạn có chắc muốn đăng xuất khỏi tất cả các thiết bị?')) {
      return;
    }

    try {
      await authService.logoutAll();
      dispatch(logout());
      dispatch(clearPermissions());
      navigate('/login');
      alert('Đã đăng xuất khỏi tất cả thiết bị');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể đăng xuất tất cả thiết bị');
    }
  };

  const handleTriggerBackup = async () => {
    if (!window.confirm('Bạn có chắc muốn tạo backup database?')) {
      return;
    }

    try {
      const result = await backupService.triggerBackup();
      if (result.success) {
        alert(`✅ ${result.message}\n\nFile: ${result.filename}\nKích thước: ${(result.size / 1024).toFixed(2)} KB`);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tạo backup';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt('⚠️ XÓA TÀI KHOẢN\n\nNhập mật khẩu để xác nhận:');
    
    if (!password) return;

    const confirmMessage = 
      '⚠️ CẢNH BÁO: Hành động này KHÔNG THỂ HOÀN TÁC!\n\n' +
      'Tất cả dữ liệu sẽ bị xóa vĩnh viễn:\n' +
      '• Tất cả ví\n' +
      '• Tất cả giao dịch\n' +
      '• Tất cả ngân sách\n' +
      '• Tất cả mục tiêu\n' +
      '• Tất cả thành tựu\n' +
      '• Tất cả thông báo\n\n' +
      'Bạn có CHẮC CHẮN muốn xóa tài khoản?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const result = await authService.deleteAccount(password);
      if (result.success) {
        alert('✅ Tài khoản đã được xóa thành công.\n\nBạn sẽ được chuyển về trang đăng nhập.');
        
        // Clear all data
        localStorage.clear();
        dispatch(logout());
        dispatch(clearPermissions());
        
        // Redirect to login
        navigate('/login');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa tài khoản';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  return (
    <Layout>
      <div className="settings">
        <h1>Cài đặt</h1>

        <div className="settings-sections">
          {/* Profile Section */}
          <div className="settings-section">
            <h2>Thông tin tài khoản</h2>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Thông tin cá nhân</h3>
                  <p>Chỉnh sửa tên và ảnh đại diện</p>
                </div>
                <button onClick={handleEditProfile} className="btn btn-secondary">
                  {showEditProfile ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              {showEditProfile && (
                <form onSubmit={handleSaveProfile} className="edit-profile-form">
                  <div className="avatar-section">
                    <div className="avatar-preview">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {fullName.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="avatar-upload">
                      <label htmlFor="avatar-upload" className="btn btn-secondary">
                        Chọn ảnh
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                      <small>JPG, PNG (tối đa 5MB)</small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                      placeholder="Ít nhất 2 ký tự"
                    />
                  </div>

                  {profileError && <div className="error-message">{profileError}</div>}

                  <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                    {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              )}

              {!showEditProfile && (
                <>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Họ và tên:</span>
                    <span className="info-value">{user?.fullName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Vai trò:</span>
                    <span className="info-value">{user?.role}</span>
                  </div>
                  {user?.twoFactorEnabled && (
                    <div className="info-row">
                      <span className="info-label">Xác thực 2 yếu tố:</span>
                      <span className="info-value" style={{ color: '#059669' }}>
                        ✓ Đã bật
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="settings-section">
            <h2>Bảo mật</h2>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Mật khẩu</h3>
                  <p>Thay đổi mật khẩu tài khoản của bạn</p>
                </div>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="btn btn-secondary"
                >
                  {showChangePassword ? 'Hủy' : 'Đổi mật khẩu'}
                </button>
              </div>

              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="change-password-form">
                  <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nhập lại mật khẩu mới</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {passwordError && <div className="error-message">{passwordError}</div>}
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                  </button>
                </form>
              )}

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Xác thực 2 yếu tố (2FA)</h3>
                  <p>
                    {user?.twoFactorEnabled
                      ? 'Đã bật xác thực 2 yếu tố'
                      : 'Thêm lớp bảo mật bằng mã từ ứng dụng xác thực'}
                  </p>
                </div>
                <Link to="/settings/2fa" className="btn btn-secondary">
                  {user?.twoFactorEnabled ? 'Quản lý 2FA' : 'Thiết lập 2FA'}
                </Link>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Nhật ký đăng nhập</h3>
                  <p>Xem lịch sử đăng nhập và phát hiện hoạt động bất thường</p>
                </div>
                <Link to="/settings/login-history" className="btn btn-secondary">
                  Xem nhật ký
                </Link>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Đăng xuất tất cả thiết bị</h3>
                  <p>Đăng xuất khỏi tất cả các thiết bị đang hoạt động</p>
                </div>
                <button onClick={handleLogoutAll} className="btn btn-warning">
                  Đăng xuất tất cả
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="settings-section">
            <h2>Tùy chọn</h2>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Ngôn ngữ</h3>
                  <p>Chọn ngôn ngữ hiển thị</p>
                </div>
                <select className="form-control">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Định dạng tiền tệ</h3>
                  <p>Chọn định dạng hiển thị tiền tệ mặc định</p>
                </div>
                <select className="form-control">
                  <option value="VND">VND (Việt Nam Đồng)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Định dạng ngày tháng</h3>
                  <p>Chọn định dạng hiển thị ngày tháng</p>
                </div>
                <select className="form-control">
                  <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Nhắc nhở ghi giao dịch hàng ngày</h3>
                  <p>Nhận thông báo nhắc nhở ghi chép giao dịch mỗi ngày</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked={false} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Thời gian nhắc nhở</h3>
                  <p>Chọn giờ nhắc nhở ghi giao dịch (mặc định: 20:00)</p>
                </div>
                <input type="time" defaultValue="20:00" className="form-control" style={{ minWidth: '120px' }} />
              </div>
            </div>
          </div>

          {/* Backup & Sync Section */}
          <div className="settings-section">
            <h2>Sao lưu & Đồng bộ</h2>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Trạng thái đồng bộ</h3>
                  <p>Dữ liệu được sao lưu tự động lên cloud</p>
                  <small style={{ color: '#059669', fontWeight: 600 }}>✓ Đã bật</small>
                </div>
              </div>

              {canViewAdmin() && (
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Sao lưu database</h3>
                    <p>Tạo bản sao lưu database (Chỉ ADMIN)</p>
                  </div>
                  <button
                    onClick={handleTriggerBackup}
                    className="btn btn-secondary"
                  >
                    Tạo Backup Ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section danger-zone">
            <h2>Vùng nguy hiểm</h2>
            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Xóa tài khoản</h3>
                  <p style={{ color: '#F44336' }}>
                    ⚠️ Xóa vĩnh viễn tài khoản và TẤT CẢ dữ liệu (không thể hoàn tác!)
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-danger"
                >
                  Xóa Tài Khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

