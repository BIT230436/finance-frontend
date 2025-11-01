import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchWallets } from '../../store/slices/walletSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { recurringTransactionService } from '../../services/recurringTransactionService';
import Layout from '../../components/Layout/Layout';
import RecurringTransactionForm from '../../components/Transaction/RecurringTransactionForm';
import { RecurringTransaction, RecurringTransactionDto } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './RecurringTransactionList.css';

const RecurringTransactionList: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { wallets } = useAppSelector((state) => state.wallet);
  const { categories } = useAppSelector((state) => state.category);
  const dispatch = useAppDispatch();
  const { canManageRecurringTransactions } = usePermissions();

  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadRecurringTransactions();
      dispatch(fetchWallets());
      dispatch(fetchCategories());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dispatch]);

  const loadRecurringTransactions = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const data = await recurringTransactionService.getAll();
      setRecurringTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách giao dịch định kỳ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!user?.id) return;
    if (window.confirm('Bạn có chắc muốn xóa giao dịch định kỳ này?')) {
      try {
        await recurringTransactionService.delete(id);
        loadRecurringTransactions();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể xóa giao dịch định kỳ');
      }
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    if (!user?.id) return;

    try {
      await recurringTransactionService.toggleActive(id, !currentActive);
      loadRecurringTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleSubmit = async (transaction: RecurringTransactionDto) => {
    if (!user?.id) return;

    try {
      if (editingTransaction) {
        await recurringTransactionService.update(editingTransaction.id, transaction);
      } else {
        await recurringTransactionService.create(transaction);
      }
      setShowModal(false);
      setEditingTransaction(null);
      loadRecurringTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu giao dịch định kỳ');
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Không xác định';
  };

  const getWalletName = (walletId: number) => {
    return wallets.find((w) => w.id === walletId)?.name || 'Không xác định';
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      DAILY: 'Hàng ngày',
      WEEKLY: 'Hàng tuần',
      MONTHLY: 'Hàng tháng',
      YEARLY: 'Hàng năm',
    };
    return labels[frequency] || frequency;
  };

  return (
    <Layout>
      <div className="recurring-transaction-list">
        <div className="page-header">
          <h1>Giao dịch định kỳ</h1>
          {canManageRecurringTransactions() && (
            <button onClick={handleCreate} className="btn btn-primary">
              + Thêm giao dịch định kỳ
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && recurringTransactions.length === 0 && (
          <div className="empty-state">
            <p>Chưa có giao dịch định kỳ nào.</p>
            {canManageRecurringTransactions() && <p>Tạo giao dịch định kỳ đầu tiên!</p>}
            {!canManageRecurringTransactions() && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Chỉ ADMIN và USER mới có thể quản lý giao dịch định kỳ.
              </p>
            )}
          </div>
        )}

        {!loading && recurringTransactions.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Ví</th>
                <th>Thể loại</th>
                <th>Tần suất</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Lần chạy tiếp theo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {recurringTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'INCOME' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td
                    className={
                      transaction.type === 'INCOME' ? 'amount income' : 'amount expense'
                    }
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {transaction.amount.toLocaleString()} VND
                  </td>
                  <td>{getWalletName(transaction.walletId)}</td>
                  <td>{getCategoryName(transaction.categoryId)}</td>
                  <td>{getFrequencyLabel(transaction.frequency)}</td>
                  <td>
                    {transaction.startDate
                      ? new Date(transaction.startDate).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td>
                    {transaction.endDate
                      ? new Date(transaction.endDate).toLocaleDateString('vi-VN')
                      : 'Không giới hạn'}
                  </td>
                  <td>
                    {transaction.nextRunDate
                      ? new Date(transaction.nextRunDate).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td>
                    {canManageRecurringTransactions() && (
                      <button
                        onClick={() => handleToggleActive(transaction.id, transaction.active)}
                        className={`btn ${transaction.active ? 'btn-success' : 'btn-secondary'}`}
                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                      >
                        {transaction.active ? 'Đang chạy' : 'Tạm dừng'}
                      </button>
                    )}
                  </td>
                  <td>
                    {canManageRecurringTransactions() && (
                      <>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="btn btn-danger"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <RecurringTransactionForm
                transaction={editingTransaction}
                wallets={wallets}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false);
                  setEditingTransaction(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecurringTransactionList;

