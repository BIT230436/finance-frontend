import { useState, useEffect } from 'react';
import { Budget, BudgetDto, Category } from '../../types';
import { budgetService } from '../../services/budgetService';

interface BudgetFormProps {
  budget?: Budget | null;
  categories: Category[];
  onSubmit: (budget: BudgetDto) => void;
  onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, categories, onSubmit, onCancel }) => {
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<'MONTHLY' | 'WEEKLY' | 'CUSTOM'>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limitAmount, setLimitAmount] = useState(0);
  const [limitAmountDisplay, setLimitAmountDisplay] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.categoryId.toString());
      setPeriod(budget.period);
      // Validate dates before setting
      if (budget.startDate) {
        const startDate = new Date(budget.startDate);
        if (!isNaN(startDate.getTime())) {
          setStartDate(budget.startDate);
        }
      }
      if (budget.endDate) {
        const endDate = new Date(budget.endDate);
        if (!isNaN(endDate.getTime())) {
          setEndDate(budget.endDate);
        }
      }
      setLimitAmount(budget.limitAmount);
      setLimitAmountDisplay(budget.limitAmount.toLocaleString('vi-VN'));
      setAlertThreshold(budget.alertThreshold * 100);
    } else {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      if (!isNaN(startOfMonth.getTime()) && !isNaN(endOfMonth.getTime())) {
        setStartDate(startOfMonth.toISOString().split('T')[0]);
        setEndDate(endOfMonth.toISOString().split('T')[0]);
      }
    }
  }, [budget]);

  const handleLimitAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^\d]/g, '');
    
    if (cleaned === '') {
      setLimitAmount(0);
      setLimitAmountDisplay('');
      return;
    }
    
    const numValue = parseInt(cleaned, 10);
    setLimitAmount(numValue);
    setLimitAmountDisplay(numValue.toLocaleString('vi-VN'));
  };

  useEffect(() => {
    if (!startDate || startDate === '') return;
    
    if (period === 'MONTHLY') {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return;
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      if (!isNaN(end.getTime())) {
        setEndDate(end.toISOString().split('T')[0]);
      }
    } else if (period === 'WEEKLY') {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return;
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      if (!isNaN(end.getTime())) {
        setEndDate(end.toISOString().split('T')[0]);
      }
    }
  }, [period, startDate]);

  // Tự động detect period dựa trên số ngày giữa startDate và endDate
  useEffect(() => {
    if (!startDate || !endDate || startDate === '' || endDate === '') return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    
    const daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Auto-detect period nếu đang là CUSTOM
    if (period === 'CUSTOM' || !period) {
      if (daysBetween >= 25 && daysBetween <= 35) {
        setPeriod('MONTHLY');
      } else if (daysBetween >= 5 && daysBetween <= 9) {
        setPeriod('WEEKLY');
      }
      // Nếu không khớp, giữ CUSTOM
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Load budget recommendation when category is selected
  useEffect(() => {
    if (categoryId && !budget) {
      const catId = parseInt(categoryId);
      if (catId > 0) {
        loadRecommendation(catId);
      }
    }
  }, [categoryId, budget]);

  const loadRecommendation = async (catId: number) => {
    try {
      setLoadingRecommendation(true);
      const rec = await budgetService.getRecommendation(catId, 3);
      setRecommendation(rec);
    } catch (error) {
      console.error('[BudgetForm] Error loading recommendation:', error);
      setRecommendation(null);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate limitAmount
    if (!limitAmount || limitAmount <= 0) {
      alert('Hạn mức ngân sách phải lớn hơn 0');
      return;
    }
    
    // Auto-detect period nếu là CUSTOM dựa trên số ngày
    let finalPeriod = period;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (period === 'CUSTOM') {
          if (daysBetween >= 25 && daysBetween <= 35) {
            finalPeriod = 'MONTHLY';
          } else if (daysBetween >= 5 && daysBetween <= 9) {
            finalPeriod = 'WEEKLY';
          }
        }
      }
    }
    
    onSubmit({
      categoryId: parseInt(categoryId),
      period: finalPeriod,
      startDate,
      endDate,
      limitAmount,
      alertThreshold: alertThreshold / 100,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{budget ? 'Sửa ngân sách' : 'Thêm ngân sách'}</h2>
      </div>

      <div className="form-group">
        <label>
          Thể loại (chỉ chi tiêu)
          {recommendation && (
            <button
              type="button"
              onClick={() => setShowRecommendation(!showRecommendation)}
              style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              💡 Đề xuất: {recommendation.recommendedAmount?.toLocaleString()} VND
            </button>
          )}
          {loadingRecommendation && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              Đang tải đề xuất...
            </span>
          )}
        </label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setShowRecommendation(false);
            setRecommendation(null);
          }}
          required
        >
          <option value="">Chọn thể loại</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {showRecommendation && recommendation && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: '#f0f9ff',
            border: '1px solid #3b82f6',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
              💡 Đề xuất từ lịch sử chi tiêu
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              {recommendation.message || 
                `Bạn thường chi trung bình ${recommendation.averageSpending?.toLocaleString() || 0} VND/tháng cho '${recommendation.categoryName}', đề xuất budget ${recommendation.recommendedAmount?.toLocaleString() || 0} VND/tháng`}
            </div>
            <button
              type="button"
              onClick={() => {
                setLimitAmount(recommendation.recommendedAmount || 0);
                setShowRecommendation(false);
              }}
              style={{
                padding: '0.25rem 0.75rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Sử dụng đề xuất
            </button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Chu kỳ</label>
        <select value={period} onChange={(e) => setPeriod(e.target.value as any)} required>
          <option value="MONTHLY">Hàng tháng</option>
          <option value="WEEKLY">Hàng tuần</option>
          <option value="CUSTOM">Tùy chỉnh</option>
        </select>
      </div>

      <div className="form-group">
        <label>Ngày bắt đầu</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          disabled={period !== 'CUSTOM'}
        />
      </div>

      <div className="form-group">
        <label>Ngày kết thúc</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          disabled={period !== 'CUSTOM'}
        />
      </div>

      <div className="form-group">
        <label>Hạn mức</label>
        <input
          type="text"
          inputMode="numeric"
          value={limitAmountDisplay}
          onChange={handleLimitAmountChange}
          placeholder="0"
          required
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="form-group">
        <label>Ngưỡng cảnh báo: {alertThreshold}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
        />
        <small>Cảnh báo khi mức sử dụng đạt tỷ lệ này</small>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {budget ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;

