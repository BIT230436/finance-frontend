import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchTransactions, deleteTransaction } from '../../store/slices/transactionSlice';
import { fetchWallets } from '../../store/slices/walletSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchBudgets } from '../../store/slices/budgetSlice';
import Layout from '../../components/Layout/Layout';
import TransactionForm from '../../components/Transaction/TransactionForm';
import TransferForm from '../../components/Transaction/TransferForm';
import { Transaction, TransactionDto } from '../../types';
import { searchTransactions as advancedSearch } from '../../utils/searchUtils';
import { getRecentSearches, saveRecentSearch, clearRecentSearches } from '../../utils/searchUtils';
import { transactionTemplateService, TransactionTemplate } from '../../services/transactionTemplateService';
import { transactionService } from '../../services/transactionService';
import { usePermissions } from '../../hooks/usePermissions';
import './TransactionList.css';

const TransactionList: React.FC = () => {
  const { transactions, loading, error } = useAppSelector((state) => state.transaction);
  const { wallets } = useAppSelector((state) => state.wallet);
  const { categories } = useAppSelector((state) => state.category);
  const { budgets } = useAppSelector((state) => state.budget);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { canManage, canUpdateTransactions, canDeleteTransactions } = usePermissions();

  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterWallet, setFilterWallet] = useState<number | ''>('');
  const [filterBudget, setFilterBudget] = useState<number | ''>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTransactions());
      dispatch(fetchWallets());
      dispatch(fetchCategories());
      dispatch(fetchBudgets());
      
      // Load templates from backend
      loadTemplates();
      loadRecentTransactions();
    }
  }, [user, dispatch]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const templatesData = await transactionTemplateService.getAll();
      setTemplates(templatesData);
    } catch (error) {
      console.error('[TransactionList] Error loading templates:', error);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const recent = await transactionService.getRecent(5);
      setRecentTransactions(recent);
    } catch (error) {
      console.error('[TransactionList] Error loading recent transactions:', error);
      setRecentTransactions([]);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowModal(true);
    setShowTemplates(false);
  };

  const handleCreateFromTemplate = async (template: TransactionTemplate) => {
    try {
      // Option 1: Use backend endpoint to create transaction from template
      const newTransaction = await transactionTemplateService.createTransactionFromTemplate(template.id);
      
      // Backend tự động cập nhật budgets sau khi tạo transaction từ template
      // Refresh budgets để hiển thị progress mới ngay lập tức
      console.log('[TransactionList] Refreshing budgets after create from template...');
      await dispatch(fetchBudgets());
      
      // Refresh data
      await dispatch(fetchTransactions());
      await dispatch(fetchWallets());
      
      alert('Đã tạo giao dịch từ mẫu thành công!');
      setShowTemplates(false);
    } catch (error: any) {
      console.error('[TransactionList] Error creating from template:', error);
      
      // Option 2: Fallback - Load template data vào form
      setEditingTransaction({
        id: 0,
        amount: template.amount,
        type: template.type,
        walletId: template.walletId,
        categoryId: template.categoryId,
        note: template.note,
        occurredAt: new Date().toISOString(), // Use current date
      });
      setShowModal(true);
      setShowTemplates(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa giao dịch này?')) {
      if (user?.id) {
        try {
          await dispatch(deleteTransaction(id)).unwrap();
          
          // Backend tự động cập nhật budgets sau khi xóa transaction
          // Refresh budgets để hiển thị progress mới ngay lập tức
          console.log('[TransactionList] Refreshing budgets after delete...');
          await dispatch(fetchBudgets());
          
          // Refresh data
          await dispatch(fetchTransactions());
          await dispatch(fetchWallets());
          
          alert('Xóa giao dịch thành công!');
        } catch (error: any) {
          console.error('[TransactionList] Delete error:', error);
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Không thể xóa giao dịch';
          alert(`Lỗi: ${errorMessage}`);
        }
      }
    }
  };

  const handleSubmit = async (transaction: TransactionDto) => {
    // TransactionForm đã xử lý create/update, chỉ cần refresh data
    setShowModal(false);
    setEditingTransaction(null);
    
    // Backend tự động cập nhật budgets sau khi tạo/cập nhật transaction
    // Refresh budgets để hiển thị progress mới ngay lập tức
    console.log('[TransactionList] Refreshing budgets after create/update...');
    await dispatch(fetchBudgets());
    
    // Refresh data
    await dispatch(fetchTransactions());
    await dispatch(fetchWallets());
    
    // Reload templates và recent transactions
    loadTemplates();
    loadRecentTransactions();
  };

  // Use advanced search utility
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter((t) => t.type === filterType);
    }
    
    // Filter by wallet
    if (filterWallet) {
      filtered = filtered.filter((t) => t.walletId === filterWallet);
    }
    
    // Filter by budget
    if (filterBudget) {
      const budget = budgets.find((b) => b.id === filterBudget);
      if (budget) {
        filtered = filtered.filter((t) => {
          if (t.categoryId !== budget.categoryId) return false;
          const transactionDate = t.occurredAt ? new Date(t.occurredAt) : null;
          if (transactionDate) {
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            if (transactionDate < startDate || transactionDate > endDate) return false;
          }
          return true;
        });
      }
    }
    
    // Advanced search by keyword
    if (searchKeyword.trim()) {
      filtered = advancedSearch(filtered, searchKeyword);
      // Save to recent searches
      saveRecentSearch(searchKeyword);
    }
    
    return filtered;
  }, [transactions, filterType, filterWallet, filterBudget, searchKeyword, budgets]);
  
  const recentSearches = useMemo(() => getRecentSearches(), [searchKeyword]);

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getWalletName = (walletId: number) => {
    return wallets.find((w) => w.id === walletId)?.name || 'Unknown';
  };

  return (
    <Layout>
      <div className="transaction-list">
        <div className="page-header">
          <h1>Giao dịch</h1>
          <div className="header-actions">
            {templates.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowTemplates(!showTemplates)} 
                  className="btn btn-secondary"
                >
                  📋 Mẫu
                </button>
                {showTemplates && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    minWidth: '200px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}>
                    <div style={{ 
                      padding: '0.5rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                    }}>
                      Mẫu giao dịch ({templates.length})
                    </div>
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleCreateFromTemplate(template)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid #f3f4f6',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{template.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {template.amount.toLocaleString()} VND - {template.note || 'Không có ghi chú'}
                        </div>
                        {template.usageCount > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                            Đã dùng {template.usageCount} lần
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {canManage() && (
              <>
                <button onClick={() => setShowTransferModal(true)} className="btn btn-secondary">
                  Chuyển tiền
                </button>
                <button onClick={handleCreate} className="btn btn-primary">
                  + Thêm giao dịch
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm từ khóa... (VD: 100k-500k, tên thể loại, số tiền)"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setShowRecentSearches(e.target.value === '' && recentSearches.length > 0);
              }}
              onFocus={() => {
                if (recentSearches.length > 0) setShowRecentSearches(true);
              }}
              onBlur={() => {
                // Delay để click vào recent search có thể hoạt động
                setTimeout(() => setShowRecentSearches(false), 200);
              }}
              className="search-input"
            />
            {showRecentSearches && recentSearches.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                marginTop: '0.25rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
              }}>
                <div style={{ 
                  padding: '0.5rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Tìm kiếm gần đây</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRecentSearches();
                      setShowRecentSearches(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Xóa
                  </button>
                </div>
                {recentSearches.map((term, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchKeyword(term);
                      setShowRecentSearches(false);
                    }}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderBottom: index < recentSearches.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    {term}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="filter-group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="filter-select"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="INCOME">Thu</option>
              <option value="EXPENSE">Chi</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filterWallet}
              onChange={(e) => setFilterWallet(e.target.value ? parseInt(e.target.value) : '')}
              className="filter-select"
            >
              <option value="">Tất cả ví</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value ? parseInt(e.target.value) : '')}
              className="filter-select"
            >
              <option value="">Tất cả ngân sách</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {getCategoryName(b.categoryId)} ({new Date(b.startDate).toLocaleDateString('vi-VN')} - {new Date(b.endDate).toLocaleDateString('vi-VN')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && filteredTransactions.length === 0 && (
          <div className="empty-state">
            <p>Không có giao dịch nào.</p>
          </div>
        )}

        {!loading && filteredTransactions.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Thể loại</th>
                <th>Ví</th>
                <th>Số tiền</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    {transaction.occurredAt
                      ? new Date(transaction.occurredAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'INCOME' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td>{getCategoryName(transaction.categoryId)}</td>
                  <td>{getWalletName(transaction.walletId)}</td>
                  <td
                    className={
                      transaction.type === 'INCOME' ? 'amount income' : 'amount expense'
                    }
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {transaction.amount.toLocaleString()}
                  </td>
                  <td>{transaction.note || '-'}</td>
                  <td>
                    <Link
                      to={`/transactions/${transaction.id}`}
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Chi tiết
                    </Link>
                    {canUpdateTransactions() && (
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="btn btn-secondary"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Sửa
                      </button>
                    )}
                    {canDeleteTransactions() && (
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="btn btn-danger"
                      >
                        Xóa
                      </button>
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
              <TransactionForm
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

        {showTransferModal && (
          <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <TransferForm
                wallets={wallets}
                onSubmit={() => {
                  setShowTransferModal(false);
                  if (user?.id) {
                    dispatch(fetchTransactions());
                    dispatch(fetchWallets());
                  }
                }}
                onCancel={() => setShowTransferModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransactionList;

