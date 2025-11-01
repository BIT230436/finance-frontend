import { useState, useEffect } from 'react';
import { Wallet, WalletDto } from '../../types';

interface WalletFormProps {
  wallet?: Wallet | null;
  onSubmit: (wallet: WalletDto) => void;
  onCancel: () => void;
}

const WalletForm: React.FC<WalletFormProps> = ({ wallet, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'CASH' | 'BANK' | 'E_WALLET'>('CASH');
  const [currency, setCurrency] = useState('VND');
  const [balance, setBalance] = useState<number>(0);
  const [balanceString, setBalanceString] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setType(wallet.type);
      setCurrency(wallet.currency);
      setBalance(wallet.balance);
      setBalanceString(wallet.balance.toLocaleString('vi-VN'));
      setIsDefault(wallet.isDefault);
    }
  }, [wallet]);

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^\d]/g, '');
    
    if (cleaned === '') {
      setBalance(0);
      setBalanceString('');
      return;
    }
    
    const numValue = parseInt(cleaned, 10);
    setBalance(numValue);
    setBalanceString(numValue.toLocaleString('vi-VN'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate balance - đảm bảo parse đúng số dư và loại bỏ leading zeros
    let finalBalance = 0;
    if (balanceString) {
      // Parse số dư từ string, loại bỏ leading zeros và spaces
      const cleanedBalance = balanceString.trim().replace(/^0+/, '') || '0';
      finalBalance = parseFloat(cleanedBalance);
    } else {
      finalBalance = balance;
    }
    
    // Validate
    if (isNaN(finalBalance)) {
      alert('Số dư không hợp lệ');
      return;
    }
    
    if (finalBalance < 0) {
      alert('Số dư không thể âm');
      return;
    }
    
    // Đảm bảo số dư là số hợp lệ và không quá lớn
    if (finalBalance > Number.MAX_SAFE_INTEGER) {
      alert('Số dư quá lớn');
      return;
    }
    
    // Round to 2 decimal places for currency
    finalBalance = Math.round(finalBalance * 100) / 100;
    
    onSubmit({
      name,
      type,
      currency,
      balance: finalBalance,
      isDefault,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{wallet ? 'Sửa ví' : 'Thêm ví'}</h2>
      </div>

      <div className="form-group">
        <label>Tên ví</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label>Loại ví</label>
        <select value={type} onChange={(e) => setType(e.target.value as any)} required>
          <option value="CASH">Tiền mặt</option>
          <option value="BANK">Ngân hàng</option>
          <option value="E_WALLET">Ví điện tử</option>
        </select>
      </div>

      <div className="form-group">
        <label>Tiền tệ</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
          <option value="VND">VND</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
        </select>
      </div>

      <div className="form-group">
        <label>Số dư ban đầu</label>
        <input
          type="text"
          inputMode="numeric"
          value={balanceString || (balance > 0 ? balance.toLocaleString('vi-VN') : '')}
          onChange={handleBalanceChange}
          placeholder="0"
          required
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          Đặt làm ví mặc định
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {wallet ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default WalletForm;

