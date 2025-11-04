import api from './api';
import { AuthResponse, User } from '../types';

// Định nghĩa kiểu cho payload đăng nhập
interface LoginPayload {
    email: string;
    password: string;
    totpCode?: string;
    captchaToken: string; // Thêm captchaToken
}

// Hàm login cũ (trong Redux Thunk - authSlice.ts)
// Bạn cần cập nhật Thunk trong authSlice.ts
// Đây là ví dụ nếu bạn gọi trực tiếp, nhưng bạn đang dùng Thunk:
// export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
//     try {
//         const response = await api.post<AuthResponse>('/auth/login', payload);
//         return response.data;
//     } catch (error: any) {
//         if (error.response?.data?.message === 'REQUIRE_2FA') {
//             throw new Error('REQUIRE_2FA');
//         }
//         throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
//     }
// };
// -> Thay vào đó, hãy cập nhật authSlice.ts

// Cập nhật Thunk trong src/store/slices/authSlice.ts:
/*
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (payload: LoginPayload, { rejectWithValue }) => { // LoginPayload từ authService.ts
        try {
            const response = await api.post<AuthResponse>('/auth/login', payload);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.message === 'REQUIRE_2FA') {
                // Sử dụng rejectWithValue để trả về lỗi có cấu trúc
                return rejectWithValue({ message: 'REQUIRE_2FA' });
            }
            return rejectWithValue({ message: error.response?.data?.message || 'Đăng nhập thất bại' });
        }
    }
);
*/
// GHI CHÚ: Tôi không thể chỉnh sửa authSlice.ts vì nó không có trong context.
// BẠN PHẢI TỰ CHỈNH SỬA `loginUser` thunk TRONG `authSlice.ts`
// để chấp nhận `captchaToken` như trong `LoginPayload` ở trên.


// ===== CÁC HÀM MỚI CHO LUỒNG ĐĂNG KÝ VÀ QUÊN MẬT KHẨU =====

/**
 * Bước 1 Đăng ký: Yêu cầu mã OTP
 */
export const requestRegistration = async (email: string, password: string, fullName: string): Promise<void> => {
    try {
        await api.post('/auth/register', { email, password, fullName });
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Yêu cầu đăng ký thất bại');
    }
};

/**
 * Bước 2 Đăng ký: Xác thực mã OTP và hoàn tất
 */
export const verifyRegistration = async (email: string, password: string, fullName: string, code: string): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/auth/register/verify', {
            email,
            password,
            fullName,
            code
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Xác thực thất bại');
    }
};

/**
 * Bước 1 Quên mật khẩu: Yêu cầu mã OTP
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
    try {
        await api.post('/auth/password/request-reset', { email });
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Yêu cầu thất bại');
    }
};

/**
 * Bước 2 Quên mật khẩu: Xác thực mã OTP và đặt mật khẩu mới
 */
export const confirmPasswordReset = async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
        await api.post('/auth/password/confirm-reset', { email, code, newPassword });
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
};


// ===== CÁC HÀM CŨ (Giữ nguyên) =====

export const refreshToken = async (token: string): Promise<AuthResponse> => {
    // ... (Giữ nguyên logic cũ)
    try {
        const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken: token });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Phiên làm việc hết hạn');
    }
};

export const getProfile = async (): Promise<User> => {
    // ... (Gi ...
    try {
        const response = await api.get<User>('/profile');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
};

// ... (Các hàm 2FA và profile khác giữ nguyên) ...
