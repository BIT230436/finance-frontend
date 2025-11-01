import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    }
  };

  const handleGoogleLogin = () => {
    // OAuth2 authorization endpoint doesn't have /api prefix
    const apiBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const baseURL = apiBaseURL.replace('/api', '');
    const oauth2URL = `${baseURL}/oauth2/authorization/google`;
    
    console.log('[Login] Redirecting to OAuth2:', oauth2URL);
    window.location.href = oauth2URL;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Đăng nhập</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="auth-divider">
          <span>HOẶC</span>
        </div>
        <button onClick={handleGoogleLogin} className="btn-google" disabled={loading}>
          Đăng nhập với Google
        </button>
        <div className="auth-links">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
          <Link to="/register">Chưa có tài khoản? Đăng ký</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

