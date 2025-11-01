import { useState } from 'react';
import { Wallet } from '../../types';
import { sharedWalletService } from '../../services/sharedWalletService';
import { useAppSelector } from '../../store/hooks';

interface SharedWalletFormProps {
  walletId: number;
  wallets: Wallet[];
  onSubmit: () => void;
  onCancel: () => void;
}

const SharedWalletForm: React.FC<SharedWalletFormProps> = ({
  walletId,
  wallets,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [memberEmail, setMemberEmail] = useState('');
  const [permission, setPermission] = useState<'READ_ONLY' | 'EDIT'>('READ_ONLY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedWallet = wallets.find((w) => w.id === walletId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validate và normalize email (giống backend)
    const trimmedEmail = memberEmail.trim();
    if (!trimmedEmail) {
      setError('Email không được để trống');
      return;
    }

    // Lowercase email (backend sẽ normalize nhưng frontend nên làm trước)
    const normalizedEmail = trimmedEmail.toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Email không hợp lệ');
      return;
    }

    // Check if inviting yourself
    if (user.email && user.email.toLowerCase() === normalizedEmail) {
      setError('Không thể chia sẻ ví với chính mình');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[SharedWalletForm] Inviting member:', { walletId, email: normalizedEmail, permission });
      
      await sharedWalletService.inviteMember(walletId, {
        walletId,
        memberEmail: normalizedEmail,
        permission,
      });
      
      console.log('[SharedWalletForm] Invitation sent successfully');
      
      // Clear form
      setMemberEmail('');
      setPermission('READ_ONLY');
      
      onSubmit();
    } catch (err: any) {
      console.error('[SharedWalletForm] Error inviting member:', err);
      
      // Backend trả về error messages rõ ràng
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Không thể gửi lời mời';
      
      // Hiển thị error message rõ ràng từ backend
      setError(errorMessage);
      
      // Log chi tiết để debug
      console.error('[SharedWalletForm] Error details:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>Mời thành viên</h2>
      </div>

      <div className="form-group">
        <label>Ví</label>
        <select value={walletId} disabled className="form-control">
          <option value={walletId}>{selectedWallet?.name || 'Chọn ví'}</option>
        </select>
      </div>

      <div className="form-group">
        <label>Email thành viên</label>
        <input
          type="email"
          value={memberEmail}
          onChange={(e) => {
            setMemberEmail(e.target.value);
            setError('');
          }}
          placeholder="example@email.com"
          required
          autoComplete="email"
        />
        <small>
          Nhập email của người bạn muốn mời tham gia ví. Email sẽ được tự động chuẩn hóa (lowercase).
        </small>
      </div>

      <div className="form-group">
        <label>Quyền truy cập</label>
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as 'READ_ONLY' | 'EDIT')}
          required
        >
          <option value="READ_ONLY">Chỉ xem - Xem giao dịch và số dư</option>
          <option value="EDIT">Chỉnh sửa - Thêm, sửa, xóa giao dịch</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi lời mời'}
        </button>
      </div>
    </form>
  );
};

export default SharedWalletForm;

