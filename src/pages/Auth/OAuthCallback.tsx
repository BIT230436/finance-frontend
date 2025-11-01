import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { fetchPermissions } from '../../store/slices/permissionsSlice';
import { User } from '../../types';
import './Auth.css';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Backend redirects to frontend with tokens in query parameters
        // Format: /auth/callback?accessToken=...&refreshToken=...&userId=...&email=...&fullName=...&role=...
        
        // Extract tokens and user info from query parameters
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');
        const fullName = searchParams.get('fullName');
        const role = searchParams.get('role');

        console.log('[OAuthCallback] OAuth2 success - tokens in query params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userId,
          email,
          fullName,
          role,
        });

        // Check if we have error in URL params (backend redirect with error)
        const errorParam = searchParams.get('error');
        if (errorParam) {
          console.error('[OAuthCallback] Error from backend:', errorParam);
          const errorMessage = searchParams.get('message') || errorParam;
          setError('Đăng nhập OAuth thất bại: ' + errorMessage);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Validate required tokens
        if (!accessToken || !refreshToken || !userId) {
          console.error('[OAuthCallback] Missing required tokens or user info:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasUserId: !!userId,
          });
          setError('Thiếu thông tin đăng nhập. Vui lòng thử lại.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Validate and normalize role
        const validRoles: ('ADMIN' | 'USER' | 'VIEWER')[] = ['ADMIN', 'USER', 'VIEWER'];
        const userRole: 'ADMIN' | 'USER' | 'VIEWER' = 
          (role && validRoles.includes(role as 'ADMIN' | 'USER' | 'VIEWER')) 
            ? (role as 'ADMIN' | 'USER' | 'VIEWER')
            : 'USER';

        // Store user
        const user: User = {
          id: parseInt(userId, 10),
          email: email || '',
          fullName: fullName || '',
          role: userRole,
        };
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));

        // Fetch permissions after successful OAuth login (same as regular login)
        await dispatch(fetchPermissions() as any);

        // Redirect to dashboard
        console.log('[OAuthCallback] OAuth2 login successful, redirecting to dashboard');
        navigate('/dashboard');
      } catch (err: any) {
        console.error('[OAuthCallback] OAuth callback error:', err);
        console.error('[OAuthCallback] Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        
        const errorMessage = err.message || 'Đăng nhập OAuth thất bại';
        setError(errorMessage);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate, dispatch, searchParams]);

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
        <h1>Lỗi OAuth</h1>
        <div className="error-message">{error}</div>
        <p>Đang chuyển hướng về trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Đang hoàn tất đăng nhập...</h1>
        <p>Vui lòng chờ trong giây lát.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

