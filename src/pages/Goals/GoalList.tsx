import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchWallets } from '../../store/slices/walletSlice';
import { goalService } from '../../services/goalService';
import Layout from '../../components/Layout/Layout';
import GoalForm from '../../components/Goal/GoalForm';
import { FinancialGoal, FinancialGoalDto } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './GoalList.css';

const GoalList: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { wallets } = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const { canCreateGoals, canUpdateGoals, canDeleteGoals } = usePermissions();

  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadGoals();
      dispatch(fetchWallets());
    }
  }, [user, dispatch]);

  const loadGoals = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách mục tiêu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGoal(null);
    setShowModal(true);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!user?.id) return;
    if (window.confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
      try {
        await goalService.delete(id);
        loadGoals();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể xóa mục tiêu');
      }
    }
  };

  const handleSubmit = async (goal: FinancialGoalDto) => {
    if (!user?.id) return;

    try {
      if (editingGoal) {
        await goalService.update(editingGoal.id, goal);
      } else {
        await goalService.create(goal);
      }
      setShowModal(false);
      setEditingGoal(null);
      loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu mục tiêu');
    }
  };

  const getWalletName = (walletId: number) => {
    return wallets.find((w) => w.id === walletId)?.name || 'Không xác định';
  };

  const getProgressPercentage = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Layout>
      <div className="goal-list">
        <div className="page-header">
          <h1>Mục tiêu tài chính</h1>
          {canCreateGoals() && (
            <button onClick={handleCreate} className="btn btn-primary">
              + Thêm mục tiêu
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && goals.length === 0 && (
          <div className="empty-state">
            <p>Chưa có mục tiêu nào.</p>
            {canCreateGoals() && (
              <p>Tạo mục tiêu đầu tiên để bắt đầu tiết kiệm!</p>
            )}
            {!canCreateGoals() && (
              <p className="info-text">Chỉ ADMIN và USER mới có thể tạo mục tiêu.</p>
            )}
          </div>
        )}

        {!loading && goals.length > 0 && (
          <div className="goals-grid">
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal);
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              const isOverdue = daysRemaining < 0 && !isCompleted;

              return (
                <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
                  <div className="goal-header">
                    <h3>{goal.name}</h3>
                    {(canUpdateGoals() || canDeleteGoals()) && (
                      <div className="goal-actions">
                        {canUpdateGoals() && (
                          <button onClick={() => handleEdit(goal)} className="btn-icon">
                            ✏️
                          </button>
                        )}
                        {canDeleteGoals() && (
                          <button onClick={() => handleDelete(goal.id)} className="btn-icon">
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {goal.description && <p className="goal-description">{goal.description}</p>}

                  <div className="goal-progress">
                    <div className="progress-info">
                      <span className="progress-amount">
                        {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} VND
                      </span>
                      <span className="progress-percentage">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="goal-meta">
                    <div className="meta-item">
                      <span className="meta-label">Ví:</span>
                      <span className="meta-value">{getWalletName(goal.walletId)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Ngày đích:</span>
                      <span className="meta-value">
                        {new Date(goal.targetDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Còn lại:</span>
                      <span className={`meta-value ${isOverdue ? 'overdue-text' : ''}`}>
                        {isOverdue ? `Quá hạn ${Math.abs(daysRemaining)} ngày` : `${daysRemaining} ngày`}
                      </span>
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="goal-completed-badge">
                      🎉 Đã hoàn thành!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <GoalForm
                goal={editingGoal}
                wallets={wallets}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false);
                  setEditingGoal(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GoalList;

