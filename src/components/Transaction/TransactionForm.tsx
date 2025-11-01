import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { createTransaction, updateTransaction } from '../../store/slices/transactionSlice';
import { Transaction, TransactionDto, Wallet, Category } from '../../types';
import { fileUploadService } from '../../services/fileUploadService';
import { useAppSelector } from '../../store/hooks';
import { transactionService, CategorySuggestion } from '../../services/transactionService';
import { transactionTemplateService, TransactionTemplate } from '../../services/transactionTemplateService';

interface TransactionFormProps {
  transaction?: Transaction | null;
  wallets: Wallet[];
  categories: Category[];
  onSubmit: (transaction: TransactionDto) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  wallets,
  categories,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { transactions } = useAppSelector((state) => state.transaction);
  const dispatch = useAppDispatch();

  const [amount, setAmount] = useState<number>(0);
  const [amountString, setAmountString] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [file, setFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [showAmountSuggestions, setShowAmountSuggestions] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<CategorySuggestion[]>([]);
  const [amountSuggestions, setAmountSuggestions] = useState<number[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const availableCategories = categories.filter((c) => c.type === type);

  // Fetch category suggestions from backend (debounced)
  useEffect(() => {
    if (!transaction && note && note.trim().length > 0) {
      const timeoutId = setTimeout(async () => {
        try {
          setLoadingSuggestions(true);
          const suggestions = await transactionService.getCategorySuggestions(note.trim(), type);
          setSuggestedCategories(suggestions);
          
          // Auto-select top suggestion nếu chưa có category
          if (suggestions.length > 0 && !categoryId) {
            setCategoryId(suggestions[0].categoryId.toString());
            console.log('[TransactionForm] Auto-selected category from backend:', suggestions[0].categoryName);
          }
        } catch (error) {
          console.error('[TransactionForm] Error fetching category suggestions:', error);
          setSuggestedCategories([]);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 500); // Debounce 500ms
      
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestedCategories([]);
    }
  }, [note, type, transaction, categoryId]);

  // Fetch amount suggestions from backend
  useEffect(() => {
    if (!transaction && categoryId) {
      const catId = parseInt(categoryId);
      if (catId > 0) {
        transactionService.getAmountSuggestions(catId)
          .then((suggestions) => {
            setAmountSuggestions(suggestions);
          })
          .catch((error) => {
            console.error('[TransactionForm] Error fetching amount suggestions:', error);
            setAmountSuggestions([]);
          });
      } else {
        setAmountSuggestions([]);
      }
    } else {
      setAmountSuggestions([]);
    }
  }, [categoryId, transaction]);

  // Duplicate detection from backend (debounced)
  useEffect(() => {
    if (!transaction && amount > 0 && categoryId && walletId && occurredAt) {
      const timeoutId = setTimeout(async () => {
        try {
          const duplicates = await transactionService.checkDuplicates({
            categoryId: parseInt(categoryId),
            walletId: parseInt(walletId),
            amount,
            date: occurredAt,
          });
          
          if (duplicates.length > 0) {
            setDuplicateWarning(duplicates[0]);
          } else {
            setDuplicateWarning(null);
          }
        } catch (error) {
          console.error('[TransactionForm] Error checking duplicates:', error);
          setDuplicateWarning(null);
        }
      }, 1000); // Debounce 1s
      
      return () => clearTimeout(timeoutId);
    } else {
      setDuplicateWarning(null);
    }
  }, [transaction, amount, categoryId, walletId, occurredAt, type]);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      setAmountString(transaction.amount.toString());
      setType(transaction.type);
      setWalletId(transaction.walletId.toString());
      setCategoryId(transaction.categoryId.toString());
      setNote(transaction.note || '');
      if (transaction.occurredAt) {
        const date = new Date(transaction.occurredAt);
        if (!isNaN(date.getTime())) {
          setOccurredAt(date.toISOString().slice(0, 16));
        }
      }
      setAttachmentUrl(transaction.attachmentUrl || null);
    } else {
      // Set default wallet only if wallets are available and walletId is empty
      if (wallets.length > 0) {
        const currentWalletId = walletId;
        if (!currentWalletId || currentWalletId === '') {
          setWalletId(wallets[0].id.toString());
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, wallets]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !walletId || !categoryId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate amount - đảm bảo parse đúng số tiền và loại bỏ leading zeros
    let finalAmount = 0;
    if (amountString) {
      // Parse số tiền từ string, loại bỏ leading zeros và spaces
      const cleanedAmount = amountString.trim().replace(/^0+/, '') || '0';
      finalAmount = parseFloat(cleanedAmount);
    } else {
      finalAmount = amount;
    }
    
    if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
      alert('Số tiền phải lớn hơn 0');
      return;
    }
    
    // Đảm bảo số tiền là số hợp lệ và không quá lớn
    if (finalAmount > Number.MAX_SAFE_INTEGER) {
      alert('Số tiền quá lớn');
      return;
    }
    
    // Round to 2 decimal places for currency
    finalAmount = Math.round(finalAmount * 100) / 100;

    setLoading(true);

    try {
      console.log('[TransactionForm] Starting submit...', { amount, type, walletId, categoryId });
      
      let finalAttachmentUrl = attachmentUrl;

      if (file) {
        console.log('[TransactionForm] Uploading file...');
        finalAttachmentUrl = await fileUploadService.upload(file);
        console.log('[TransactionForm] File uploaded:', finalAttachmentUrl);
      }

      const transactionDto: TransactionDto = {
        amount: finalAmount,
        type,
        walletId: parseInt(walletId),
        categoryId: parseInt(categoryId),
        note: note || undefined,
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
        attachmentUrl: finalAttachmentUrl,
      };

      console.log('[TransactionForm] Transaction DTO:', transactionDto);

      // Check for duplicate before creating
      if (!transaction && duplicateWarning) {
        const confirmed = window.confirm(
          `Cảnh báo: Giao dịch tương tự đã tồn tại:\n` +
          `- Số tiền: ${duplicateWarning.amount.toLocaleString()}\n` +
          `- Thể loại: ${categories.find(c => c.id === duplicateWarning.categoryId)?.name}\n` +
          `- Ngày: ${new Date(duplicateWarning.occurredAt).toLocaleString('vi-VN')}\n\n` +
          `Bạn có muốn tiếp tục tạo giao dịch này không?`
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }

      if (transaction) {
        console.log('[TransactionForm] Updating transaction...', transaction.id);
        const result = await dispatch(
          updateTransaction({ id: transaction.id, transaction: transactionDto })
        ).unwrap();
        console.log('[TransactionForm] Update success:', result);
        alert('Cập nhật giao dịch thành công!');
      } else {
        console.log('[TransactionForm] Creating transaction...');
        const result = await dispatch(
          createTransaction(transactionDto)
        ).unwrap();
        console.log('[TransactionForm] Create success:', result);
        alert('Tạo giao dịch thành công!');
        
        // Suggest saving as template nếu transaction tương tự thường xuyên
        const similarCount = transactions.filter(
          t => t.categoryId === transactionDto.categoryId &&
               Math.abs(t.amount - transactionDto.amount) / transactionDto.amount < 0.1
        ).length;
        
        if (similarCount >= 3 && !showSaveTemplate) {
          const category = categories.find(c => c.id === transactionDto.categoryId);
          const suggestedName = category 
            ? `${category.name} - ${transactionDto.amount.toLocaleString()} VND`
            : 'Transaction Template';
          
          const shouldSave = window.confirm(
            'Bạn thường tạo giao dịch tương tự. Bạn có muốn lưu làm mẫu để tạo nhanh hơn không?'
          );
          if (shouldSave) {
            setShowSaveTemplate(true);
            setTemplateName(suggestedName);
          }
        }
      }

      onSubmit(transactionDto);
    } catch (error: any) {
      console.error('[TransactionForm] Error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.error || 
                          'Không thể lưu giao dịch';
      console.error('[TransactionForm] Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: errorMessage,
      });
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{transaction ? 'Sửa giao dịch' : 'Thêm giao dịch'}</h2>
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
        <label>
          Số tiền
          {amountSuggestions.length > 0 && categoryId && (
            <button
              type="button"
              onClick={() => setShowAmountSuggestions(!showAmountSuggestions)}
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
              💡 Đề xuất
            </button>
          )}
        </label>
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
              setShowAmountSuggestions(false);
              return;
            }
            
            const numValue = parseInt(cleaned, 10);
            setAmount(numValue);
            setAmountString(numValue.toLocaleString('vi-VN'));
            setShowAmountSuggestions(false);
          }}
          required
          placeholder="0"
          autoComplete="off"
          spellCheck="false"
        />
        {showAmountSuggestions && amountSuggestions.length > 0 && (
          <div style={{ 
            marginTop: '0.5rem', 
            display: 'flex', 
            gap: '0.5rem', 
            flexWrap: 'wrap' 
          }}>
            {amountSuggestions.map((suggestedAmount) => (
              <button
                key={suggestedAmount}
                type="button"
                onClick={() => {
                  setAmount(suggestedAmount);
                  setAmountString(suggestedAmount.toString());
                  setShowAmountSuggestions(false);
                }}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {suggestedAmount.toLocaleString()} VND
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Ví</label>
        <select
          value={walletId}
          onChange={(e) => setWalletId(e.target.value)}
          required
        >
          <option value="">Chọn ví</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.currency})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>
          Thể loại
          {suggestedCategories.length > 0 && !transaction && (
            <span style={{ 
              marginLeft: '0.5rem', 
              fontSize: '0.75rem', 
              color: '#059669',
              fontWeight: 500
            }}>
              💡 {suggestedCategories.length} đề xuất
            </span>
          )}
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          style={{
            borderColor: suggestedCategories.some(sc => sc.categoryId === parseInt(categoryId)) ? '#059669' : undefined
          }}
        >
          <option value="">Chọn thể loại</option>
          {loadingSuggestions && <option disabled>Đang tải đề xuất...</option>}
          {/* Suggested categories first */}
          {suggestedCategories.map((suggestion) => {
            const category = categories.find((c) => c.id === suggestion.categoryId);
            if (!category) return null;
            const confidenceColor = 
              suggestion.confidence === 'high' ? '#059669' :
              suggestion.confidence === 'medium' ? '#f59e0b' : '#6b7280';
            return (
              <option 
                key={suggestion.categoryId} 
                value={suggestion.categoryId} 
                style={{ fontWeight: 'bold', color: confidenceColor }}
              >
                {suggestion.confidence === 'high' ? '⭐' : suggestion.confidence === 'medium' ? '💡' : '⚪'} 
                {' '}{suggestion.categoryName} (Đề xuất - {suggestion.score} điểm)
              </option>
            );
          })}
          {/* Other categories */}
          {availableCategories
            .filter((c) => !suggestedCategories.some((sc) => sc.categoryId === c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label>Ngày & Giờ</label>
        <input
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
        />
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

      <div className="form-group">
        <label>Đính kèm (Hóa đơn/Ảnh)</label>
        <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
        {attachmentUrl && !file && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            Hiện có: {attachmentUrl}
          </p>
        )}
      </div>

      {duplicateWarning && !transaction && (
        <div style={{
          padding: '0.75rem',
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: '#92400e',
        }}>
          ⚠️ <strong>Cảnh báo:</strong> Giao dịch tương tự đã tồn tại (
          {duplicateWarning.amount.toLocaleString()} VND, 
          {categories.find(c => c.id === duplicateWarning.categoryId)?.name}, 
          {new Date(duplicateWarning.occurredAt).toLocaleDateString('vi-VN')})
          {duplicateWarning.note && ` - ${duplicateWarning.note}`}
        </div>
      )}

      {showSaveTemplate && (
        <div style={{
          padding: '1rem',
          background: '#f0f9ff',
          border: '1px solid #3b82f6',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
        }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Lưu làm mẫu:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Tên mẫu..."
              style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
            />
            <button
              type="button"
              onClick={async () => {
                if (templateName.trim()) {
                  try {
                    await transactionTemplateService.create({
                      name: templateName.trim(),
                      walletId: parseInt(walletId),
                      categoryId: parseInt(categoryId),
                      amount,
                      type,
                      note: note || undefined,
                    });
                    alert('Đã lưu mẫu thành công!');
                    setShowSaveTemplate(false);
                  } catch (error: any) {
                    console.error('[TransactionForm] Error saving template:', error);
                    alert(`Lỗi: ${error?.response?.data?.message || 'Không thể lưu mẫu'}`);
                  }
                }
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setShowSaveTemplate(false)}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang lưu...' : transaction ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;

