import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Auth.css';
// Import service mới
import { requestRegistration, verifyRegistration } from '../../services/authService';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';

const Register: React.FC = () => {
    // Thêm state 'step' để quản lý luồng 2 bước
    const [step, setStep] = useState<'details' | 'verify'>('details');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [code, setCode] = useState(''); // State cho mã OTP

    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Bước 1: Gửi yêu cầu đăng ký (lấy mã OTP)
    const handleRequestRegistration = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Gọi API mới: requestRegistration
            await requestRegistration(email, password, fullName);
            toast.success('Mã xác thực đã được gửi đến email của bạn.');
            setStep('verify'); // Chuyển sang bước 2
        } catch (error: any) {
            toast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Bước 2: Xác thực mã OTP và hoàn tất đăng ký
    const handleVerifyRegistration = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Gọi API mới: verifyRegistration
            const userData = await verifyRegistration(email, password, fullName, code);

            // Đăng nhập thành công
            dispatch(setCredentials(userData));
            toast.success('Đăng ký thành công! Đang chuyển đến trang chủ...');
            navigate('/dashboard');

        } catch (error: any) {
            toast.error(error.message || 'Mã xác thực không đúng. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">

                {/* Giao diện Bước 1: Nhập thông tin */}
                {step === 'details' && (
                    <>
                        <h2>Đăng ký</h2>
                        <form onSubmit={handleRequestRegistration} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="fullName">Họ và tên</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Lấy mã xác thực'}
                            </button>
                        </form>
                    </>
                )}

                {/* Giao diện Bước 2: Nhập mã OTP */}
                {step === 'verify' && (
                     <>
                        <h2>Xác thực Email</h2>
                        <p>Một mã OTP 6 chữ số đã được gửi đến <strong>{email}</strong>. Vui lòng nhập mã vào bên dưới.</p>
                        <form onSubmit={handleVerifyRegistration} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="code">Mã xác thực (OTP)</label>
                                <input
                                    type="text"
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    minLength={6}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Đang xác thực...' : 'Hoàn tất Đăng ký'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setStep('details')}
                                disabled={isLoading}
                            >
                                Quay lại
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-switch">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
