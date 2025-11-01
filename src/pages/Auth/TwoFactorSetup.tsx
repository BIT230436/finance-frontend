import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { authService } from '../../services/authService';
import Layout from '../../components/Layout/Layout';
import { QRCodeSVG } from 'qrcode.react';
import './TwoFactorSetup.css';

const TwoFactorSetup: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    handleEnable2FA();
  }, [user, navigate]);

  const handleEnable2FA = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const response = await authService.enable2FA();
      setSecret(response.secret);
      
      // Backend đã trả về qrCodeUrl sẵn, sử dụng luôn
      if (response.qrCodeUrl) {
        setQrUrl(response.qrCodeUrl);
      } else {
        // Fallback: Tự tạo nếu backend chưa trả về
        const qrData = `otpauth://totp/FinanceApp:${user.email}?secret=${response.secret}&issuer=FinanceApp`;
        setQrUrl(qrData);
      }
      
      console.log('[2FA Setup] Enabled successfully:', {
        hasSecret: !!response.secret,
        hasQrCodeUrl: !!response.qrCodeUrl,
        message: response.message,
      });
    } catch (err: any) {
      console.error('[2FA Setup] Enable failed:', err);
      setError(err.response?.data?.message || 'Không thể kích hoạt 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (verificationCode.length !== 6) {
      setError('Mã xác thực phải có 6 chữ số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verify2FASetup(verificationCode);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác thực không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="two-factor-setup">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
          <h1>Thiết lập xác thực 2 yếu tố (2FA)</h1>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              Xác thực 2 yếu tố đã được kích hoạt thành công! Đang chuyển hướng...
            </div>
          )}

          {loading && !secret && <p>Đang tạo secret...</p>}

          {secret && qrUrl && !success && (
            <div className="qr-setup-container">
              <div className="qr-instructions">
                <h2>Bước 1: Quét mã QR</h2>
                <p>
                  Mở ứng dụng Google Authenticator trên điện thoại và quét mã QR bên dưới:
                </p>
              </div>

              <div className="qr-code-container">
                <QRCodeSVG value={qrUrl} size={256} level="H" includeMargin={true} />
              </div>

              <div className="manual-entry">
                <p>Hoặc nhập thủ công:</p>
                <div className="secret-display">
                  <code>{secret}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(secret)}
                    className="btn btn-secondary"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Copy Secret
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerify} className="verify-form">
                <h2>Bước 2: Xác thực</h2>
                <p>Nhập mã 6 chữ số từ Google Authenticator:</p>
                <div className="form-group">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={loading}
                    style={{
                      fontSize: '1.5rem',
                      textAlign: 'center',
                      letterSpacing: '0.5rem',
                      width: '200px',
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading || verificationCode.length !== 6}>
                  {loading ? 'Đang xác thực...' : 'Xác thực'}
                </button>
              </form>

              <div className="help-text">
                <p>
                  <strong>Lưu ý:</strong> Lưu mã secret này ở nơi an toàn. Nếu mất điện thoại, bạn cần mã này để
                  khôi phục truy cập.
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Bỏ qua (thiết lập sau)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TwoFactorSetup;

