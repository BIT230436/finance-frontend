import { useState, useEffect } from 'react';
import { RecurringTransaction, RecurringTransactionDto, Wallet, Category } from '../../types';

interface RecurringTransactionFormProps {
  transaction?: RecurringTransaction | null;
  wallets: Wallet[];
  categories: Category[];
  onSubmit: (transaction: RecurringTransactionDto) => void;
  onCancel: () => void;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({
  transaction,
  wallets,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState(0);
  const [amountDisplay, setAmountDisplay] = useState('');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');

  const availableCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount);
      setAmountDisplay(transaction.amount.toLocaleString('vi-VN'));
      setWalletId(transaction.walletId.toString());
      setCategoryId(transaction.categoryId.toString());
      setFrequency(transaction.frequency);
      setStartDate(transaction.startDate);
      setEndDate(transaction.endDate || '');
      setNote(transaction.note || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      if (wallets.length > 0 && !walletId) {
        setWalletId(wallets[0].id.toString());
      }
    }
  }, [transaction, wallets]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^\d]/g, '');
    
    if (cleaned === '') {
      setAmount(0);
      setAmountDisplay('');
      return;
    }
    
    const numValue = parseInt(cleaned, 10);
    setAmount(numValue);
    setAmountDisplay(numValue.toLocaleString('vi-VN'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      walletId: parseInt(walletId),
      categoryId: parseInt(categoryId),
      amount,
      type,
      frequency,
      startDate,
      endDate: endDate || undefined,
      note: note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{transaction ? 'Sửa giao dịch định kỳ' : 'Thêm giao dịch định kỳ'}</h2>
      </div>

      <div className="form-group">
        <label>Loại</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label>
            <input
              type="radio"
              value="INCOME"
              checked={type === 'INCOME'}
              onChange={(e) => {
                setType('INCOME');
                setCategoryId('');
              }}
            />
            Thu
          </label>
          <label>
            <input
              type="radio"
              value="EXPENSE"
              checked={type === 'EXPENSE'}
              onChange={(e) => {
                setType('EXPENSE');
                setCategoryId('');
              }}
            />
            Chi
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Số tiền</label>
        <input
          type="text"
          inputMode="numeric"
          value={amountDisplay}
          onChange={handleAmountChange}
          placeholder="0"
          required
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="form-group">
        <label>Ví</label>
        <select value={walletId} onChange={(e) => setWalletId(e.target.value)} required>
          <option value="">Chọn ví</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.currency})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Thể loại</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Chọn thể loại</option>
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Tần suất</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as any)}
          required
        >
          <option value="DAILY">Hàng ngày</option>
          <option value="WEEKLY">Hàng tuần</option>
          <option value="MONTHLY">Hàng tháng</option>
          <option value="YEARLY">Hàng năm</option>
        </select>
      </div>

      <div className="form-group">
        <label>Ngày bắt đầu</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Ngày kết thúc (tùy chọn)</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
        />
        <small>Để trống nếu muốn chạy mãi mãi</small>
      </div>

      <div className="form-group">
        <label>Ghi chú</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={255}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {transaction ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default RecurringTransactionForm;

