import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchWallets } from '../../store/slices/walletSlice';
import { sharedWalletService } from '../../services/sharedWalletService';
import Layout from '../../components/Layout/Layout';
import SharedWalletForm from '../../components/Wallet/SharedWalletForm';
import { SharedWallet, SharedWalletMember } from '../../types';
import './SharedWallets.css';

const SharedWallets: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { wallets } = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  const [sharedWallets, setSharedWallets] = useState<SharedWallet[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<SharedWallet[]>([]);
  const [walletMembers, setWalletMembers] = useState<Record<number, SharedWalletMember[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);

  const loadSharedWallets = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const data = await sharedWalletService.getSharedWallets();
      setSharedWallets(data.filter((sw) => sw.status === 'ACCEPTED'));
      setPendingInvitations(data.filter((sw) => sw.status === 'PENDING' && sw.memberId === user.id));

      // Load members for owned wallets
      const ownedWalletIds = data
        .filter((sw) => sw.ownerId === user.id)
        .map((sw) => sw.walletId);
      
      const uniqueWalletIds = Array.from(new Set(ownedWalletIds));
      
      for (const walletId of uniqueWalletIds) {
        try {
          const members = await sharedWalletService.getWalletMembers(walletId);
          setWalletMembers((prev) => ({ ...prev, [walletId]: members }));
        } catch (err) {
          // Ignore errors for wallets without members
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách ví chia sẻ');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSharedWallets();
      dispatch(fetchWallets());
    }
  }, [user, dispatch, loadSharedWallets]);


  const handleInvite = (walletId: number) => {
    setSelectedWallet(walletId);
    setShowInviteModal(true);
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    if (!user?.id) return;
    try {
      await sharedWalletService.acceptInvitation(invitationId);
      loadSharedWallets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể chấp nhận lời mời');
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    if (!user?.id) return;
    if (window.confirm('Bạn có chắc muốn từ chối lời mời?')) {
      try {
        await sharedWalletService.rejectInvitation(invitationId);
        loadSharedWallets();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể từ chối lời mời');
      }
    }
  };

  const handleRemoveMember = async (walletId: number, memberId: number) => {
    if (!user?.id) return;
    if (window.confirm('Bạn có chắc muốn xóa thành viên này khỏi ví?')) {
      try {
        await sharedWalletService.removeMember(memberId);
        loadSharedWallets();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể xóa thành viên');
      }
    }
  };

  const handleUpdatePermission = async (
    walletId: number,
    memberId: number,
    permission: 'READ_ONLY' | 'EDIT'
  ) => {
    if (!user?.id) return;
    try {
      await sharedWalletService.updateMemberPermission(memberId, permission);
      loadSharedWallets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật quyền');
    }
  };

  const getWalletName = (walletId: number) => {
    return wallets.find((w) => w.id === walletId)?.name || 'Không xác định';
  };

  return (
    <Layout>
      <div className="shared-wallets">
        <div className="page-header">
          <h1>Ví chia sẻ</h1>
          <button
            onClick={() => {
              if (wallets.length > 0) {
                setSelectedWallet(wallets[0].id);
                setShowInviteModal(true);
              } else {
                alert('Bạn cần có ít nhất một ví để chia sẻ');
              }
            }}
            className="btn btn-primary"
          >
            + Mời thành viên
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="section">
            <h2>Lời mời đang chờ</h2>
            <div className="invitations-list">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="invitation-card">
                  <div className="invitation-info">
                    <h3>{getWalletName(invitation.walletId)}</h3>
                    <p>
                      {invitation.ownerName} đã mời bạn tham gia ví này
                    </p>
                    <span className="permission-badge">{invitation.permission === 'EDIT' ? 'Chỉnh sửa' : 'Chỉ xem'}</span>
                  </div>
                  <div className="invitation-actions">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      className="btn btn-primary"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation.id)}
                      className="btn btn-secondary"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Wallets */}
        <div className="section">
          <h2>Ví được chia sẻ với tôi</h2>
          {loading && <p>Đang tải...</p>}
          {!loading && sharedWallets.length === 0 && (
            <div className="empty-state">
              <p>Bạn chưa có ví nào được chia sẻ.</p>
            </div>
          )}
          {!loading && sharedWallets.length > 0 && (
            <div className="shared-wallets-list">
              {sharedWallets.map((sw) => (
                <div key={sw.id} className="shared-wallet-card">
                  <div className="wallet-header">
                    <h3>{getWalletName(sw.walletId)}</h3>
                    <span className="permission-badge">{sw.permission === 'EDIT' ? 'Chỉnh sửa' : 'Chỉ xem'}</span>
                  </div>
                  <div className="wallet-owner">
                    <span>Chủ sở hữu: {sw.ownerName}</span>
                  </div>
                  <div className="wallet-actions">
                    <Link to={`/wallets/${sw.walletId}`} className="btn btn-secondary">
                      Xem ví
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Shared Wallets (Wallets I own and shared) */}
        <div className="section">
          <h2>Ví của tôi đã chia sẻ</h2>
          {wallets.length === 0 ? (
            <div className="empty-state">
              <p>Bạn chưa có ví nào.</p>
            </div>
          ) : (
            <div className="my-wallets-list">
              {wallets.map((wallet) => {
                const members = walletMembers[wallet.id] || [];
                return (
                  <div key={wallet.id} className="my-wallet-card">
                    <div className="wallet-header">
                      <h3>{wallet.name}</h3>
                      <button
                        onClick={() => handleInvite(wallet.id)}
                        className="btn btn-secondary"
                      >
                        + Mời thành viên
                      </button>
                    </div>

                    {members.length > 0 ? (
                      <div className="members-list">
                        <h4>Thành viên ({members.length})</h4>
                        {members.map((member) => (
                          <div key={member.id} className="member-item">
                            <div className="member-info">
                              <span className="member-name">{member.userName}</span>
                              <span className="member-email">({member.userEmail})</span>
                              <span className="member-date">Tham gia: {new Date(member.joinedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="member-actions">
                              <select
                                value={member.permission}
                                onChange={(e) =>
                                  handleUpdatePermission(
                                    wallet.id,
                                    member.id,
                                    e.target.value as 'READ_ONLY' | 'EDIT'
                                  )
                                }
                                className="permission-select"
                              >
                                <option value="READ_ONLY">Chỉ xem</option>
                                <option value="EDIT">Chỉnh sửa</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(wallet.id, member.id)}
                                className="btn btn-danger"
                                style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-members">Chưa có thành viên nào. Mời ngay!</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showInviteModal && selectedWallet && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <SharedWalletForm
                walletId={selectedWallet}
                wallets={wallets}
                onSubmit={async () => {
                  setShowInviteModal(false);
                  setSelectedWallet(null);
                  loadSharedWallets();
                }}
                onCancel={() => {
                  setShowInviteModal(false);
                  setSelectedWallet(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SharedWallets;

