import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchWallets, createWallet, updateWallet, deleteWallet } from '../../store/slices/walletSlice';
import Layout from '../../components/Layout/Layout';
import WalletForm from '../../components/Wallet/WalletForm';
import { WalletDto, Wallet } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './WalletList.css';

const WalletList: React.FC = () => {
  const { wallets, loading, error } = useAppSelector((state) => state.wallet);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { canCreateWallets, canUpdateWallets, canDeleteWallets } = usePermissions();
  const [showModal, setShowModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWallets());
    }
  }, [user, dispatch]);

  const handleCreate = () => {
    setEditingWallet(null);
    setShowModal(true);
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa ví này?')) {
      if (user?.id) {
        try {
          await dispatch(deleteWallet(id)).unwrap();
          // Refresh data after successful deletion
          await dispatch(fetchWallets());
          alert('Xóa ví thành công!');
        } catch (error: any) {
          // Backend trả về error message rõ ràng nếu không thể xóa
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Không thể xóa ví';
          alert(`Lỗi: ${errorMessage}`);
          console.error('[WalletList] Delete error:', error);
        }
      }
    }
  };

  const handleSubmit = async (wallet: WalletDto) => {
    if (!user?.id) return;

    try {
      console.log('[WalletList] Submitting wallet:', wallet);
      
      if (editingWallet) {
        console.log('[WalletList] Updating wallet:', editingWallet.id);
        const result = await dispatch(updateWallet({ id: editingWallet.id, wallet })).unwrap();
        console.log('[WalletList] Update success:', result);
        alert('Cập nhật ví thành công!');
      } else {
        console.log('[WalletList] Creating wallet...');
        const result = await dispatch(createWallet(wallet)).unwrap();
        console.log('[WalletList] Create success:', result);
        alert('Tạo ví thành công!');
      }
      
      // Refresh data
      await dispatch(fetchWallets());
      
      setShowModal(false);
      setEditingWallet(null);
    } catch (error: any) {
      console.error('[WalletList] Error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Không thể lưu ví';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  return (
    <Layout>
      <div className="wallet-list">
        <div className="page-header">
          <h1>Ví</h1>
          {canCreateWallets() && (
            <button onClick={handleCreate} className="btn btn-primary">
              + Thêm ví
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && wallets.length === 0 && (
          <div className="empty-state">
            <p>Chưa có ví nào. Hãy tạo ví đầu tiên của bạn!</p>
          </div>
        )}

        {!loading && wallets.length > 0 && (
          <div className="wallet-grid">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="wallet-card">
                <div className="wallet-header">
                  <h3>{wallet.name}</h3>
                  {wallet.isDefault && <span className="badge">Mặc định</span>}
                </div>
                <div className="wallet-info">
                  <p className="wallet-type">{wallet.type}</p>
                  <p className="wallet-currency">{wallet.currency}</p>
                  <p className={`wallet-balance ${wallet.balance < 0 ? 'negative' : ''}`}>
                    {wallet.balance.toLocaleString()} {wallet.currency}
                    {wallet.balance < 0 && (
                      <span className="overdraft-warning" title="Số dư âm (nợ)">
                        ⚠️
                      </span>
                    )}
                  </p>
                </div>
                <div className="wallet-actions">
                  <Link to={`/wallets/${wallet.id}`} className="btn btn-secondary">
                    Chi tiết
                  </Link>
                  {canUpdateWallets() && (
                    <button onClick={() => handleEdit(wallet)} className="btn btn-secondary">
                      Sửa
                    </button>
                  )}
                  {canDeleteWallets() && (
                    <button
                      onClick={() => handleDelete(wallet.id)}
                      className="btn btn-danger"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <WalletForm
                wallet={editingWallet}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false);
                  setEditingWallet(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WalletList;

