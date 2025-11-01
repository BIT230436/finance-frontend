import React, { useState } from 'react';
import { SplitExpenseDto } from '../../types';

interface ExpenseSplitFormProps {
  onSubmit: (split: SplitExpenseDto) => void;
  onCancel: () => void;
}

const ExpenseSplitForm: React.FC<ExpenseSplitFormProps> = ({ onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalAmountDisplay, setTotalAmountDisplay] = useState('');
  const [participantIds, setParticipantIds] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customAmounts, setCustomAmounts] = useState<{ [key: number]: number }>({});

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^\d]/g, '');
    
    if (cleaned === '') {
      setTotalAmount(0);
      setTotalAmountDisplay('');
      return;
    }
    
    const numValue = parseInt(cleaned, 10);
    setTotalAmount(numValue);
    setTotalAmountDisplay(numValue.toLocaleString('vi-VN'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || totalAmount <= 0 || !participantIds.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const ids = participantIds.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
    if (ids.length === 0) {
      alert('Vui lòng nhập ID người tham gia (cách nhau bằng dấu phẩy)');
      return;
    }

    // Check for duplicate IDs
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      alert('❌ ID người tham gia bị trùng lặp! Vui lòng nhập mỗi ID một lần.');
      return;
    }

    const split: SplitExpenseDto = {
      description: description.trim(),
      totalAmount: totalAmount,
      participantUserIds: uniqueIds,  // Use unique IDs
    };

    if (splitType === 'custom') {
      split.customAmounts = customAmounts;
    }

    onSubmit(split);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-split-form">
      <div className="form-group">
        <label htmlFor="description">Mô tả:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ví dụ: Dinner at restaurant"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="totalAmount">Tổng tiền:</label>
        <input
          type="text"
          inputMode="numeric"
          id="totalAmount"
          value={totalAmountDisplay}
          onChange={handleAmountChange}
          placeholder="0"
          required
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="form-group">
        <label htmlFor="participantIds">
          ID Người tham gia (cách nhau bằng dấu phẩy):
        </label>
        <input
          type="text"
          id="participantIds"
          value={participantIds}
          onChange={(e) => setParticipantIds(e.target.value)}
          placeholder="Ví dụ: 1, 2, 3"
          required
        />
        <small>Ví dụ: 1, 2, 3 (nhập ID của các người dùng)</small>
      </div>

      <div className="form-group">
        <label>Cách chia:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="equal"
              checked={splitType === 'equal'}
              onChange={() => setSplitType('equal')}
            />
            Chia đều
          </label>
          <label>
            <input
              type="radio"
              value="custom"
              checked={splitType === 'custom'}
              onChange={() => setSplitType('custom')}
            />
            Chia theo số tiền tùy chỉnh
          </label>
        </div>
      </div>

      {splitType === 'custom' && (
        <div className="form-group">
          <label>Số tiền tùy chỉnh cho mỗi người:</label>
          <small>
            Nhập số tiền cho mỗi người theo ID (ví dụ: ID 1: 200000, ID 2: 150000)
          </small>
          <p className="info-text">
            Tính năng này yêu cầu cấu hình chi tiết. Vui lòng sử dụng chia đều hoặc cấu hình trong code.
          </p>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Tạo Chia Bill
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Hủy
        </button>
      </div>
    </form>
  );
};

export default ExpenseSplitForm;

