import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchWallets } from '../../store/slices/walletSlice';
import { fetchBudgets, fetchAlerts } from '../../store/slices/budgetSlice';
import { fetchSummary, fetchCashflow } from '../../store/slices/reportSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { goalService } from '../../services/goalService';
import { expenseSplitService } from '../../services/expenseSplitService';
import { achievementService } from '../../services/achievementService';
import { FinancialGoal, PendingSplitPayment, AchievementResponse } from '../../types';
import Layout from '../../components/Layout/Layout';
import CashflowChart from '../../components/Charts/CashflowChart';
import HealthScoreWidget from '../../components/HealthScore/HealthScoreWidget';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { wallets, defaultWallet } = useAppSelector((state) => state.wallet);
  const { budgets, alerts } = useAppSelector((state) => state.budget);
  const { summary, cashflow } = useAppSelector((state) => state.report);
  const { transactions } = useAppSelector((state) => state.transaction);
  const { categories } = useAppSelector((state) => state.category);
  const dispatch = useAppDispatch();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingSplitPayment[]>([]);
  const [achievements, setAchievements] = useState<AchievementResponse | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWallets());
      dispatch(fetchBudgets());
      dispatch(fetchAlerts());
      dispatch(fetchTransactions());
      dispatch(fetchCategories());

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dispatch(fetchSummary({ from: startOfMonth, to: now }));
      dispatch(fetchCashflow({ from: startOfMonth, to: now }));
      
      // Load goals
      goalService.getAll().then(setGoals).catch(() => {});
      
      // Load pending split payments
      expenseSplitService.getPendingPayments().then(setPendingPayments).catch(() => {});
      
      // Load achievements
      achievementService.getMyAchievements().then(setAchievements).catch(() => {});
    }
  }, [user, dispatch]);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <Layout>
      <div className="dashboard">
        <h1>Xin chào, {user?.fullName}!</h1>

        {/* Financial Health Score */}
        <HealthScoreWidget compact />

        <div className="dashboard-grid">
          {/* Summary Cards */}
          <div className="summary-card">
            <h3>💵 Tổng số dư</h3>
            <p className="amount">{totalBalance.toLocaleString()} VND</p>
          </div>

          <div className="summary-card income-card">
            <h3>📈 Tổng thu</h3>
            <p className="amount income">{summary?.totalIncome.toLocaleString() || 0} VND</p>
          </div>

          <div className="summary-card expense-card">
            <h3>📉 Tổng chi</h3>
            <p className="amount expense">{summary?.totalExpense.toLocaleString() || 0} VND</p>
          </div>

          <div className="summary-card">
            <h3>📊 Số giao dịch</h3>
            <p className="amount">{summary?.transactionCount || 0}</p>
          </div>

          {/* Budget Alerts */}
          {alerts.length > 0 && (
            <div className="alerts-section">
              <h2>Cảnh báo ngân sách</h2>
              <div className="alerts-list">
                {alerts.map((alert) => {
                  const percentage = (alert.usedAmount / alert.limitAmount) * 100;
                  return (
                    <div key={alert.id} className="alert-item">
                      <div className="alert-header">
                        <span>Cảnh báo ngân sách</span>
                        <span className="alert-percentage">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <p>
                        Đã dùng: {alert.usedAmount.toLocaleString()} /{' '}
                        {alert.limitAmount.toLocaleString()} VND
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cashflow Chart */}
          <div className="chart-section">
            <h2>Dòng tiền</h2>
            {cashflow.length > 0 ? (
              <CashflowChart data={cashflow} />
            ) : (
              <p>Không có dữ liệu</p>
            )}
          </div>

          {/* Achievements */}
          {achievements && achievements.unlockedCount > 0 && (
            <div className="achievements-section">
              <div className="section-header">
                <h2>🏆 Thành Tựu</h2>
                <span>{achievements.unlockedCount}/{achievements.totalCount} - {achievements.totalPoints} điểm</span>
              </div>
              <div className="achievements-preview">
                {achievements.unlocked.slice(0, 5).map((userAchievement) => (
                  <div key={userAchievement.id} className="achievement-icon-preview" title={userAchievement.achievement.name}>
                    {userAchievement.achievement.icon}
                  </div>
                ))}
                {achievements.unlockedCount > 5 && (
                  <Link to="/achievements" className="more-achievements">
                    +{achievements.unlockedCount - 5} thêm
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Pending Split Payments */}
          {pendingPayments.length > 0 && (
            <div className="pending-splits-section">
              <div className="section-header">
                <h2>💸 Cần Thanh Toán</h2>
                <Link to="/expense-split" className="btn btn-secondary">
                  Xem tất cả
                </Link>
              </div>
              <div className="pending-splits-list">
                {pendingPayments.slice(0, 3).map((payment) => (
                  <div key={payment.splitExpenseId} className="pending-split-item">
                    <div className="split-info">
                      <strong>{payment.description}</strong>
                      <span className="split-creator">bởi {payment.createdBy}</span>
                    </div>
                    <div className="split-amount">
                      {payment.yourShare.toLocaleString()} VND
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Goals */}
          {goals.length > 0 && (
            <div className="goals-section">
              <div className="section-header">
                <h2>Mục tiêu tài chính</h2>
                <Link to="/goals" className="btn btn-secondary">
                  Xem tất cả
                </Link>
              </div>
              <div className="goals-list">
                {goals.slice(0, 3).map((goal) => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  return (
                    <div key={goal.id} className="goal-item">
                      <div className="goal-header-mini">
                        <h4>{goal.name}</h4>
                        <span className="goal-progress-text">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar-mini">
                        <div
                          className="progress-fill-mini"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="goal-amount-mini">
                        {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} VND
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="recent-section">
            <div className="recent-header">
              <h2>Giao dịch gần đây</h2>
              <Link to="/transactions" className="btn btn-secondary">
                Xem tất cả
              </Link>
            </div>
            {transactions.length === 0 ? (
              <p>Chưa có giao dịch nào</p>
            ) : (
              <div className="recent-transactions-list">
                {transactions
                  .filter((t) => t.occurredAt)
                  .sort((a, b) => {
                    const dateA = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
                    const dateB = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .slice(0, 5)
                  .map((transaction) => {
                    const category = categories.find((c) => c.id === transaction.categoryId);
                    const wallet = wallets.find((w) => w.id === transaction.walletId);
                    return (
                      <div key={transaction.id} className={`recent-transaction-item ${transaction.type.toLowerCase()}`}>
                        <div className="transaction-icon">
                          <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                            {transaction.type === 'INCOME' ? '↑' : '↓'}
                          </span>
                        </div>
                        <div className="transaction-info">
                          <div className="transaction-main">
                            <span className="transaction-category">
                              {category?.name || 'Không xác định'}
                            </span>
                            <span
                              className={`transaction-amount ${transaction.type.toLowerCase()}`}
                            >
                              {transaction.type === 'INCOME' ? '+' : '-'}
                              {transaction.amount.toLocaleString()} {wallet?.currency || 'VND'}
                            </span>
                          </div>
                          <div className="transaction-meta">
                            <span className="transaction-date">
                              {transaction.occurredAt
                                ? new Date(transaction.occurredAt).toLocaleDateString('vi-VN')
                                : 'N/A'}
                            </span>
                            <span className="transaction-wallet">{wallet?.name || 'N/A'}</span>
                            {transaction.note && (
                              <span className="transaction-note">• {transaction.note}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

