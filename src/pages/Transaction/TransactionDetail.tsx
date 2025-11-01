import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchTransactions, deleteTransaction } from '../../store/slices/transactionSlice';
import { fetchWallets } from '../../store/slices/walletSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchBudgets } from '../../store/slices/budgetSlice';
import Layout from '../../components/Layout/Layout';
import TransactionForm from '../../components/Transaction/TransactionForm';
import { TransactionDto } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './TransactionDetail.css';

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { transactions, loading } = useAppSelector((state) => state.transaction);
  const { wallets } = useAppSelector((state) => state.wallet);
  const { categories } = useAppSelector((state) => state.category);
  const dispatch = useAppDispatch();
  const { canUpdateTransactions, canDeleteTransactions } = usePermissions();

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTransactions());
      dispatch(fetchWallets());
      dispatch(fetchCategories());
    }
  }, [user, dispatch]);

  const transaction = transactions.find((t) => t.id === parseInt(id || '0'));
  const category = categories.find((c) => c.id === transaction?.categoryId);
  const wallet = wallets.find((w) => w.id === transaction?.walletId);

  const handleDelete = async () => {
    if (!transaction || !user?.id) return;
    if (window.confirm('Bạn có chắc muốn xóa giao dịch này?')) {
      try {
        await dispatch(deleteTransaction(transaction.id)).unwrap();
        
        // Backend tự động cập nhật budgets sau khi xóa transaction
        // Refresh budgets để hiển thị progress mới ngay lập tức
        console.log('[TransactionDetail] Refreshing budgets after delete...');
        await dispatch(fetchBudgets());
        
        navigate('/transactions');
      } catch (error: any) {
        console.error('[TransactionDetail] Delete error:', error);
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Không thể xóa giao dịch';
        alert(`Lỗi: ${errorMessage}`);
      }
    }
  };

  const handleUpdate = async (updatedTransaction: TransactionDto) => {
    setShowEditModal(false);
    if (user?.id) {
      // Backend tự động cập nhật budgets sau khi cập nhật transaction
      // Refresh budgets để hiển thị progress mới ngay lập tức
      console.log('[TransactionDetail] Refreshing budgets after update...');
      await dispatch(fetchBudgets());
      
      dispatch(fetchTransactions());
      dispatch(fetchWallets());
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="transaction-detail">
          <p>Đang tải...</p>
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="transaction-detail">
          <div className="not-found">
            <h2>Không tìm thấy giao dịch</h2>
            <p>Giao dịch không tồn tại hoặc đã bị xóa.</p>
            <Link to="/transactions" className="btn btn-primary">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transaction-detail">
        <div className="detail-header">
          <Link to="/transactions" className="back-link">
            ← Quay lại
          </Link>
          {(canUpdateTransactions() || canDeleteTransactions()) && (
            <div className="header-actions">
              {canUpdateTransactions() && (
                <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
                  Sửa
                </button>
              )}
              {canDeleteTransactions() && (
                <button onClick={handleDelete} className="btn btn-danger">
                  Xóa
                </button>
              )}
            </div>
          )}
        </div>

        <div className="detail-content">
          <div className="detail-card">
            <h2>Chi tiết giao dịch</h2>

            <div className="detail-row">
              <span className="detail-label">Loại:</span>
              <span className={`detail-value type-badge ${transaction.type.toLowerCase()}`}>
                {transaction.type === 'INCOME' ? 'Thu' : 'Chi'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Số tiền:</span>
              <span
                className={`detail-value amount ${transaction.type.toLowerCase()}`}
                style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
              >
                {transaction.type === 'INCOME' ? '+' : '-'}
                {transaction.amount.toLocaleString()} {wallet?.currency || 'VND'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Thể loại:</span>
              <span className="detail-value">
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    backgroundColor: category?.color || '#666',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                    verticalAlign: 'middle',
                  }}
                ></span>
                {category?.name || 'Không xác định'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Ví:</span>
              <span className="detail-value">{wallet?.name || 'Không xác định'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Ngày giờ:</span>
              <span className="detail-value">
                {transaction.occurredAt
                  ? new Date(transaction.occurredAt).toLocaleString('vi-VN')
                  : 'N/A'}
              </span>
            </div>

            {transaction.note && (
              <div className="detail-row">
                <span className="detail-label">Ghi chú:</span>
                <span className="detail-value">{transaction.note}</span>
              </div>
            )}

            {transaction.attachmentUrl && (
              <div className="detail-row attachment-row">
                <span className="detail-label">Đính kèm:</span>
                <div className="attachment-preview">
                  {transaction.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${transaction.attachmentUrl}`}
                      alt="Receipt"
                      className="attachment-image"
                    />
                  ) : (
                    <a
                      href={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${transaction.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      Xem file đính kèm
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <TransactionForm
                transaction={transaction}
                wallets={wallets}
                categories={categories}
                onSubmit={handleUpdate}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransactionDetail;

