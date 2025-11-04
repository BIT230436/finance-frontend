import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Auth.css';
// Import service mới
import { requestPasswordReset, confirmPasswordReset } from '../../services/authService';

const ForgotPassword = () => {
    // Thêm state 'step' để quản lý luồng
    const [step, setStep] = useState<'request' | 'confirm'>('request');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(''); // Mã OTP
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Bước 1: Yêu cầu gửi mã OTP
    const handleRequestReset = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await requestPasswordReset(email);
            toast.success('Mã khôi phục đã được gửi đến email của bạn.');
            setStep('confirm'); // Chuyển sang bước 2
        } catch (error: any) {
            toast.error(error.message || 'Yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Bước 2: Xác thực OTP và đặt mật khẩu mới
    const handleConfirmReset = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await confirmPasswordReset(email, code, newPassword);
            toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
            setStep('request'); // Quay lại bước 1 (hoặc chuyển hướng /login)
            setEmail('');
            setCode('');
            setNewPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Mã OTP không đúng hoặc đã hết hạn.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">

                {/* Giao diện Bước 1: Nhập Email */}
                {step === 'request' && (
                    <>
                        <h2>Quên mật khẩu</h2>
                        <p>Nhập email của bạn để nhận mã khôi phục mật khẩu.</p>
                        <form onSubmit={handleRequestReset} className="auth-form">
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
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
                            </button>
                        </form>
                    </>
                )}

                {/* Giao diện Bước 2: Nhập mã OTP và mật khẩu mới */}
                {step === 'confirm' && (
                    <>
                        <h2>Đặt lại mật khẩu</h2>
                        <p>Một mã OTP đã được gửi đến <strong>{email}</strong>. Vui lòng nhập mã và mật khẩu mới.</p>
                        <form onSubmit={handleConfirmReset} className="auth-form">
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
                            <div className="form-group">
                                <label htmlFor="newPassword">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </button>
                             <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setStep('request')}
                                disabled={isLoading}
                            >
                                Gửi lại mã
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-switch">
                    Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
