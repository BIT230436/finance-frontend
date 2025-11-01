import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';

const AuthError: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    console.error('[AuthError] OAuth2 Error:', error, message);

    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      const errorParam = error ? `?error=${encodeURIComponent(error)}` : '';
      navigate(`/login${errorParam}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  const error = searchParams.get('error');
  const message = searchParams.get('message') || 'Đăng nhập bằng Google thất bại';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Lỗi đăng nhập</h1>
        <div className="error-message">
          {error && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Mã lỗi:</strong> {error}
            </div>
          )}
          <div>{message}</div>
        </div>
        <p>Đang chuyển hướng đến trang đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthError;

