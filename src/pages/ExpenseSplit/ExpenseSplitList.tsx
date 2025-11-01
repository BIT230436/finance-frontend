import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { expenseSplitService } from '../../services/expenseSplitService';
import { SplitExpense, PendingSplitPayment, SplitExpenseDto } from '../../types';
import Layout from '../../components/Layout/Layout';
import ExpenseSplitForm from '../../components/ExpenseSplit/ExpenseSplitForm';
import { usePermissions } from '../../hooks/usePermissions';
import './ExpenseSplit.css';

const ExpenseSplitList: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { canManage } = usePermissions();
  const [splits, setSplits] = useState<SplitExpense[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingSplitPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSplits();
      loadPendingPayments();
    }
  }, [user]);

  const loadSplits = async () => {
    try {
      setLoading(true);
      const data = await expenseSplitService.getAll();
      setSplits(data);
    } catch (err: any) {
      console.error('[ExpenseSplitList] Error loading splits:', err);
      setError(err.message || 'Failed to load split expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPayments = async () => {
    try {
      const data = await expenseSplitService.getPendingPayments();
      setPendingPayments(data);
    } catch (err: any) {
      console.error('[ExpenseSplitList] Error loading pending payments:', err);
    }
  };

  const handleCreate = () => {
    setShowModal(true);
  };

  const handleSubmit = async (split: SplitExpenseDto) => {
    try {
      await expenseSplitService.create(split);
      alert('Tạo chia bill thành công!');
      setShowModal(false);
      loadSplits();
      loadPendingPayments();
    } catch (err: any) {
      console.error('[ExpenseSplitList] Error creating split:', err);
      
      // Better error message handling
      let errorMessage = 'Không thể tạo chia bill';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Check for specific errors
      if (errorMessage.includes('Không tìm thấy người dùng')) {
        const match = errorMessage.match(/người dùng:\s*(\d+)/);
        const userId = match ? match[1] : '';
        errorMessage = `Người dùng với ID ${userId} không tồn tại trong hệ thống. Vui lòng kiểm tra lại ID.`;
      }
      
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const handleMarkPaid = async (splitId: number) => {
    if (!window.confirm('Xác nhận bạn đã thanh toán phần của mình?')) {
      return;
    }

    try {
      await expenseSplitService.markPaid(splitId);
      alert('Đã đánh dấu thanh toán!');
      loadSplits();
      loadPendingPayments();
    } catch (err: any) {
      console.error('[ExpenseSplitList] Error marking paid:', err);
      const errorMessage = err.message || 'Không thể đánh dấu thanh toán';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FFC107';
      case 'PARTIALLY_PAID':
        return '#FF9800';
      case 'SETTLED':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ Thanh Toán';
      case 'PARTIALLY_PAID':
        return 'Đã Thanh Toán Một Phần';
      case 'SETTLED':
        return 'Đã Thanh Toán Đủ';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="expense-split-container">
        <div className="page-header">
          <h1>💸 Chia Bill</h1>
          {canManage() && (
            <button onClick={handleCreate} className="btn btn-primary">
              + Tạo Chia Bill
            </button>
          )}
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div className="pending-payments-section">
            <h2>Cần Thanh Toán</h2>
            <div className="pending-payments-list">
              {pendingPayments.map((payment) => (
                <div key={payment.splitExpenseId} className="pending-payment-card">
                  <div className="payment-info">
                    <h3>{payment.description || 'Chia bill'}</h3>
                    <p>Tạo bởi: {payment.createdBy || 'Unknown'}</p>
                    <p className="payment-amount">
                      Phần của bạn: <strong>{(payment.yourShare || 0).toLocaleString()}</strong>
                    </p>
                    <p className="payment-total">
                      Tổng: {(payment.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkPaid(payment.splitExpenseId)}
                    className="btn btn-success"
                  >
                    Đánh Dấu Đã Trả
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Splits Section */}
        <div className="splits-section">
          <h2>Tất Cả Các Chia Bill</h2>
          {splits.length === 0 ? (
            <p className="no-data">Chưa có chia bill nào</p>
          ) : (
            <div className="splits-list">
              {splits.map((split) => (
                <div key={split.id} className="split-card">
                  <div className="split-header">
                    <h3>{split.description || 'Chia bill'}</h3>
                    <span
                      className="split-status"
                      style={{ backgroundColor: getStatusColor(split.status) }}
                    >
                      {getStatusText(split.status)}
                    </span>
                  </div>
                  <div className="split-info">
                    <p>Tổng: <strong>{(split.totalAmount || 0).toLocaleString()}</strong></p>
                    <p>Tạo bởi: {split.creatorName || 'Unknown'}</p>
                    <p>Ngày tạo: {split.createdAt ? new Date(split.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div className="split-participants">
                    <h4>Người tham gia:</h4>
                    <ul>
                      {split.participants && split.participants.length > 0 ? (
                        split.participants.map((participant) => (
                          <li key={participant.id} className={participant.paid ? 'paid' : 'unpaid'}>
                            <span>{participant.userName || 'Unknown'}</span>
                            <span>{(participant.amount || 0).toLocaleString()}</span>
                            <span className="payment-status">
                              {participant.paid ? '✅ Đã trả' : '⏳ Chưa trả'}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>Không có người tham gia</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Split Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Tạo Chia Bill Mới</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <ExpenseSplitForm onSubmit={handleSubmit} onCancel={() => setShowModal(false)} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExpenseSplitList;

