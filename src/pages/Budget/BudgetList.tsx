import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchBudgets, createBudget, updateBudget, deleteBudget, fetchAlerts } from '../../store/slices/budgetSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import Layout from '../../components/Layout/Layout';
import BudgetForm from '../../components/Budget/BudgetForm';
import { Budget, BudgetDto } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './BudgetList.css';

const BudgetList: React.FC = () => {
  const { budgets, alerts, loading, error } = useAppSelector((state) => state.budget);
  const { categories } = useAppSelector((state) => state.category);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { canCreateBudgets, canUpdateBudgets, canDeleteBudgets } = usePermissions();

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchBudgets());
      dispatch(fetchAlerts());
      dispatch(fetchCategories());
    }
  }, [user, dispatch]);

  const handleCreate = () => {
    setEditingBudget(null);
    setShowModal(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa ngân sách này?')) {
      if (user?.id) {
        try {
          await dispatch(deleteBudget(id)).unwrap();
          // Refresh data after successful deletion
          await dispatch(fetchBudgets());
          await dispatch(fetchAlerts());
          alert('Xóa ngân sách thành công!');
        } catch (error: any) {
          // Backend trả về error message rõ ràng nếu không thể xóa
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Không thể xóa ngân sách';
          alert(`Lỗi: ${errorMessage}`);
          console.error('[BudgetList] Delete error:', error);
        }
      }
    }
  };

  const handleSubmit = async (budget: BudgetDto) => {
    if (!user?.id) return;

    try {
      console.log('[BudgetList] Submitting budget:', budget);
      
      if (editingBudget) {
        console.log('[BudgetList] Updating budget:', editingBudget.id);
        const result = await dispatch(updateBudget({ id: editingBudget.id, budget })).unwrap();
        console.log('[BudgetList] Update success:', result);
        alert('Cập nhật ngân sách thành công!');
      } else {
        console.log('[BudgetList] Creating budget...');
        const result = await dispatch(createBudget(budget)).unwrap();
        console.log('[BudgetList] Create success:', result);
        alert('Tạo ngân sách thành công!');
      }
      
      // Refresh data
      await dispatch(fetchBudgets());
      await dispatch(fetchAlerts());
      
      setShowModal(false);
      setEditingBudget(null);
    } catch (error: any) {
      console.error('[BudgetList] Error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Không thể lưu ngân sách';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  return (
    <Layout>
      <div className="budget-list">
        <div className="page-header">
          <h1>Ngân sách</h1>
          {canCreateBudgets() && (
            <button onClick={handleCreate} className="btn btn-primary">
              + Thêm ngân sách
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="alerts-section">
            <h2>⚠️ Cảnh báo ngân sách</h2>
            <div className="alerts-grid">
              {alerts.map((alert) => {
                const percentage = (alert.usedAmount / alert.limitAmount) * 100;
                return (
                  <div key={alert.id} className="alert-card">
                    <div className="alert-header">
                      <span className="category-name">{getCategoryName(alert.categoryId)}</span>
                      <span className="alert-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="alert-amount">
                      {alert.usedAmount.toLocaleString()} / {alert.limitAmount.toLocaleString()} VND
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading && <p>Đang tải...</p>}

        {!loading && budgets.length === 0 && (
          <div className="empty-state">
            <p>Chưa có ngân sách nào.</p>
            {canCreateBudgets() && <p>Hãy tạo ngân sách đầu tiên!</p>}
            {!canCreateBudgets() && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Chỉ ADMIN và USER mới có thể tạo ngân sách.
              </p>
            )}
          </div>
        )}

        {!loading && budgets.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Thể loại</th>
                <th>Chu kỳ</th>
                <th>Khoảng ngày</th>
                <th>Hạn mức</th>
                <th>Đã dùng</th>
                <th>Tiến độ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const percentage = (budget.usedAmount / budget.limitAmount) * 100;
                const isAlert = percentage >= budget.alertThreshold * 100;
                return (
                  <tr key={budget.id} className={isAlert ? 'alert-row' : ''}>
                    <td>{getCategoryName(budget.categoryId)}</td>
                    <td>{budget.period}</td>
                    <td>
                      {budget.startDate && budget.endDate
                        ? `${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}`
                        : 'N/A'}
                    </td>
                    <td>{budget.limitAmount.toLocaleString()} VND</td>
                    <td>{budget.usedAmount.toLocaleString()} VND</td>
                    <td>
                      <div className="progress-bar-inline">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                        <span className="progress-text">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      {canUpdateBudgets() && (
                        <button
                          onClick={() => handleEdit(budget)}
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Sửa
                        </button>
                      )}
                      {canDeleteBudgets() && (
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="btn btn-danger"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <BudgetForm
                budget={editingBudget}
                categories={expenseCategories}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false);
                  setEditingBudget(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BudgetList;

