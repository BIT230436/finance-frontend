import { useState, useEffect } from 'react';
import { FinancialGoal, FinancialGoalDto, Wallet } from '../../types';

interface GoalFormProps {
  goal?: FinancialGoal | null;
  wallets: Wallet[];
  onSubmit: (goal: FinancialGoalDto) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, wallets, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [targetAmountDisplay, setTargetAmountDisplay] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [walletId, setWalletId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount);
      setTargetAmountDisplay(goal.targetAmount.toLocaleString('vi-VN'));
      setTargetDate(goal.targetDate);
      setWalletId(goal.walletId.toString());
      setDescription(goal.description || '');
    } else {
      const today = new Date();
      const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      setTargetDate(nextYear.toISOString().split('T')[0]);
      if (wallets.length > 0 && !walletId) {
        setWalletId(wallets[0].id.toString());
      }
    }
  }, [goal, wallets]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digits
    const cleaned = value.replace(/[^\d]/g, '');
    
    if (cleaned === '') {
      setTargetAmount(0);
      setTargetAmountDisplay('');
      return;
    }
    
    const numValue = parseInt(cleaned, 10);
    setTargetAmount(numValue);
    setTargetAmountDisplay(numValue.toLocaleString('vi-VN'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      targetAmount,
      targetDate,
      walletId: parseInt(walletId),
      description: description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{goal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}</h2>
      </div>

      <div className="form-group">
        <label>Tên mục tiêu</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Mua xe, Du lịch châu Âu..."
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label>Số tiền mục tiêu</label>
        <input
          type="text"
          inputMode="numeric"
          value={targetAmountDisplay}
          onChange={handleAmountChange}
          placeholder="0"
          required
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="form-group">
        <label>Ngày đích</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-group">
        <label>Ví tiết kiệm</label>
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
        <label>Mô tả (tùy chọn)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Thêm ghi chú về mục tiêu của bạn..."
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {goal ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default GoalForm;

