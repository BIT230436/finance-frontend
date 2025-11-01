import { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { transferBetweenWallets } from '../../store/slices/transactionSlice';
import { fetchWallets } from '../../store/slices/walletSlice';
import { fetchBudgets } from '../../store/slices/budgetSlice';
import { Wallet } from '../../types';
import { useAppSelector } from '../../store/hooks';

interface TransferFormProps {
  wallets: Wallet[];
  onSubmit: () => void;
  onCancel: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ wallets, onSubmit, onCancel }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountString, setAmountString] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fromWallet = wallets.find((w) => w.id === parseInt(fromWalletId));
  const toWallet = wallets.find((w) => w.id === parseInt(toWalletId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !fromWalletId || !toWalletId) return;

    setError('');

    // Validate same wallet
    if (fromWalletId === toWalletId) {
      setError('Ví nguồn và ví đích không thể giống nhau');
      return;
    }

    // Parse amount from formatted string
    const cleanedAmount = amountString.replace(/[^\d]/g, '');
    const finalAmount = parseInt(cleanedAmount, 10);
    
    if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    // Validate available balance
    if (fromWallet && finalAmount > fromWallet.balance) {
      setError(`Số dư không đủ. Số dư hiện tại: ${fromWallet.balance.toLocaleString()}, Số tiền cần chuyển: ${finalAmount.toLocaleString()}`);
      return;
    }

    // Validate currency match
    if (fromWallet && toWallet && fromWallet.currency !== toWallet.currency) {
      setError(`Ví phải có cùng loại tiền tệ. Ví nguồn: ${fromWallet.currency}, Ví đích: ${toWallet.currency}`);
      return;
    }

    // Lưu ý: Backend tự động generate notes cho transfer transactions
    // "Chuyển tiền đến [tên ví đích]" cho expense
    // "Nhận tiền từ [tên ví nguồn]" cho income

    setLoading(true);

    try {
      console.log('[TransferForm] Transferring:', {
        fromWalletId: parseInt(fromWalletId),
        toWalletId: parseInt(toWalletId),
        amount: finalAmount,
      });
      
      await dispatch(
        transferBetweenWallets({
          fromWalletId: parseInt(fromWalletId),
          toWalletId: parseInt(toWalletId),
          amount: finalAmount,
        })
      ).unwrap();
      
      console.log('[TransferForm] Transfer successful');
      
      // Refresh data
      await Promise.all([
        dispatch(fetchWallets()),
        dispatch(fetchBudgets()),
      ]);
      
      alert('Chuyển tiền thành công!');
      onSubmit();
    } catch (err: any) {
      console.error('[TransferForm] Error:', err);
      
      // Parse error message from backend
      let errorMessage = 'Không thể chuyển tiền';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Display error
      setError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>Chuyển tiền giữa các ví</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Từ ví</label>
        <select
          value={fromWalletId}
          onChange={(e) => setFromWalletId(e.target.value)}
          required
        >
          <option value="">Chọn ví nguồn</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} - {w.balance.toLocaleString()} {w.currency}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Đến ví</label>
        <select
          value={toWalletId}
          onChange={(e) => setToWalletId(e.target.value)}
          required
        >
          <option value="">Chọn ví đích</option>
          {wallets
            .filter((w) => w.id !== parseInt(fromWalletId))
            .map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} - {w.balance.toLocaleString()} {w.currency}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label>Số tiền</label>
        <input
          type="text"
          inputMode="numeric"
          value={amountString || (amount > 0 ? amount.toLocaleString('vi-VN') : '')}
          onChange={(e) => {
            const value = e.target.value;
            const cleaned = value.replace(/[^\d]/g, '');
            
            if (cleaned === '') {
              setAmount(0);
              setAmountString('');
              setError('');
              return;
            }
            
            const numValue = parseInt(cleaned, 10);
            setAmount(numValue);
            setAmountString(numValue.toLocaleString('vi-VN'));
            
            // Real-time validation
            if (fromWallet && numValue > fromWallet.balance) {
              setError(`Số dư không đủ! Khả dụng: ${fromWallet.balance.toLocaleString()}`);
            } else {
              setError('');
            }
          }}
          placeholder="0"
          required
          autoComplete="off"
          spellCheck="false"
        />
        {fromWallet && (
          <small style={{ 
            color: amount > fromWallet.balance ? '#F44336' : '#666',
            fontWeight: amount > fromWallet.balance ? 'bold' : 'normal'
          }}>
            Khả dụng: {fromWallet.balance.toLocaleString()} {fromWallet.currency}
            {amount > fromWallet.balance && ' ⚠️ Không đủ'}
          </small>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang chuyển...' : 'Chuyển'}
        </button>
      </div>
    </form>
  );
};

export default TransferForm;

