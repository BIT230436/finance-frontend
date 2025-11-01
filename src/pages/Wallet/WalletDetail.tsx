import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchWallets } from '../../store/slices/walletSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import Layout from '../../components/Layout/Layout';
import { usePermissions } from '../../hooks/usePermissions';
import './WalletDetail.css';

const WalletDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { wallets, loading } = useAppSelector((state) => state.wallet);
  const { transactions } = useAppSelector((state) => state.transaction);
  const { categories } = useAppSelector((state) => state.category);
  const dispatch = useAppDispatch();
  const { canCreateTransactions } = usePermissions();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWallets());
      dispatch(fetchTransactions());
      dispatch(fetchCategories());
    }
  }, [user, dispatch]);

  const wallet = wallets.find((w) => w.id === parseInt(id || '0'));
  const walletTransactions = transactions.filter((t) => t.walletId === parseInt(id || '0'));

  const income = walletTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = walletTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <Layout>
        <div className="wallet-detail">
          <p>Đang tải...</p>
        </div>
      </Layout>
    );
  }

  if (!wallet) {
    return (
      <Layout>
        <div className="wallet-detail">
          <div className="not-found">
            <h2>Không tìm thấy ví</h2>
            <p>Ví không tồn tại hoặc đã bị xóa.</p>
            <Link to="/wallets" className="btn btn-primary">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Không xác định';
  };

  return (
    <Layout>
      <div className="wallet-detail">
        <div className="detail-header">
          <Link to="/wallets" className="back-link">
            ← Quay lại
          </Link>
        </div>

        <div className="wallet-info-card">
          <div className="wallet-header">
            <h1>{wallet.name}</h1>
            {wallet.isDefault && <span className="badge">Mặc định</span>}
          </div>

          <div className="wallet-stats">
            <div className="stat-item">
              <span className="stat-label">Số dư hiện tại</span>
              <span className={`stat-value ${wallet.balance < 0 ? 'negative' : ''}`}>
                {wallet.balance.toLocaleString()} {wallet.currency}
                {wallet.balance < 0 && (
                  <span className="overdraft-warning" title="Số dư âm (nợ). Backend cho phép overdraft nhỏ nhưng sẽ cảnh báo nếu quá lớn (> -10 triệu VND).">
                    ⚠️
                  </span>
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Loại ví</span>
              <span className="stat-value">{wallet.type}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tiền tệ</span>
              <span className="stat-value">{wallet.currency}</span>
            </div>
          </div>

          <div className="wallet-summary">
            <div className="summary-item income">
              <span className="summary-label">Tổng thu</span>
              <span className="summary-value">+{income.toLocaleString()} {wallet.currency}</span>
            </div>
            <div className="summary-item expense">
              <span className="summary-label">Tổng chi</span>
              <span className="summary-value">-{expense.toLocaleString()} {wallet.currency}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Số giao dịch</span>
              <span className="summary-value">{walletTransactions.length}</span>
            </div>
          </div>
        </div>

        <div className="wallet-transactions">
          <h2>Lịch sử giao dịch</h2>
          {walletTransactions.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có giao dịch nào trong ví này.</p>
              {canCreateTransactions() && (
                <Link to="/transactions" className="btn btn-primary">
                  Tạo giao dịch mới
                </Link>
              )}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Thể loại</th>
                  <th>Số tiền</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {walletTransactions
                  .filter((t) => t.occurredAt)
                  .sort((a, b) => {
                    const dateA = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
                    const dateB = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        {transaction.occurredAt
                          ? new Date(transaction.occurredAt).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>
                        <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                          {transaction.type === 'INCOME' ? 'Thu' : 'Chi'}
                        </span>
                      </td>
                      <td>{getCategoryName(transaction.categoryId)}</td>
                      <td
                        className={
                          transaction.type === 'INCOME' ? 'amount income' : 'amount expense'
                        }
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {transaction.amount.toLocaleString()} {wallet.currency}
                      </td>
                      <td>{transaction.note || '-'}</td>
                      <td>
                        <Link
                          to={`/transactions/${transaction.id}`}
                          className="btn btn-secondary"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WalletDetail;

