import React, { useState, FormEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import './Auth.css';

// Thêm ReCAPTCHA
import ReCAPTCHA from 'react-google-recaptcha';

// Giả sử API_URL được định nghĩa trong services/api
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [needs2FA, setNeeds2FA] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Thêm state và ref cho reCAPTCHA
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        // Chuyển hướng đến endpoint OAuth2 của backend
        window.location.href = `${API_URL}/oauth2/authorization/google`;
    };

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Kiểm tra Captcha
        if (!captchaToken) {
            toast.error('Vui lòng xác thực bạn không phải là robot.');
            setIsLoading(false);
            return;
        }

        try {
            // Truyền captchaToken vào payload
            const resultAction = await dispatch(loginUser({
                email,
                password,
                totpCode: needs2FA ? totpCode : undefined,
                captchaToken: captchaToken // Gửi token
            }));

            unwrapResult(resultAction);
            toast.success('Đăng nhập thành công!');
            navigate('/dashboard');

        } catch (error: any) {
            setIsLoading(false);
            // Reset captcha để người dùng thử lại
            recaptchaRef.current?.reset();
            setCaptchaToken(null);

            // Xử lý lỗi REQUIRE_2FA
            if (error.message === 'REQUIRE_2FA') {
                toast('Vui lòng nhập mã xác thực 2 yếu tố (2FA).');
                setNeeds2FA(true); // Hiển thị ô nhập mã 2FA
            } else {
                toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
                setNeeds2FA(false); // Ẩn ô 2FA nếu đăng nhập thất bại vì lý do khác
            }
        }
    };

    // Hàm callback khi reCAPTCHA thay đổi
    const onCaptchaChange = (token: string | null) => {
        setCaptchaToken(token);
    };

    const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    if (!recaptchaSiteKey) {
        console.error("Lỗi: REACT_APP_RECAPTCHA_SITE_KEY chưa được cấu hình trong .env");
        toast.error("Lỗi cấu hình reCAPTCHA. Vui lòng liên hệ quản trị viên.");
        return <div>Lỗi cấu hình reCAPTCHA.</div>;
    }

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <h2>Đăng nhập</h2>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={needs2FA}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={needs2FA}
                        />
                    </div>

                    {/* Hiển thị ô 2FA nếu cần */}
                    {needs2FA && (
                        <div className="form-group">
                            <label htmlFor="totpCode">Mã 2FA</label>
                            <input
                                type="text"
                                id="totpCode"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                placeholder="Nhập 6 số từ ứng dụng"
                                required
                            />
                        </div>
                    )}

                    {/* Thêm component reCAPTCHA */}
                    {!needs2FA && (
                        <div className="form-group recaptcha-wrapper">
                             <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={recaptchaSiteKey}
                                onChange={onCaptchaChange}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : (needs2FA ? 'Xác thực' : 'Đăng nhập')}
                    </button>
                </form>

                <div className="forgot-password-link">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>

                <div className="auth-divider">
                    <span>HOẶC</span>
                </div>

                <button onClick={handleGoogleLogin} className="btn btn-google">
                    {/* Thêm icon Google nếu bạn dùng react-icons */}
                    {/* <FaGoogle /> */}
                    Đăng nhập với Google
                </button>

                <div className="auth-switch">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
