import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// Thay đổi import để import tất cả hàm dưới dạng một object 'authService'
import * as authService from '../../services/authService';
import { AuthResponse, User } from '../../types';
import { fetchPermissions, clearPermissions } from './permissionsSlice';

// --- ĐỊNH NGHĨA PAYLOAD MỚI ---

// Payload cho thunk `login`
interface LoginPayload {
  email: string;
  password: string;
  totpCode?: string;
  captchaToken: string;
}

// Payload cho Bước 1 Đăng ký (Gửi OTP)
interface RequestRegistrationPayload {
  email: string;
  password: string;
  fullName: string;
}

// Payload cho Bước 2 Đăng ký (Xác thực OTP)
interface VerifyRegistrationPayload {
  email: string;
  password: string;
  fullName: string;
  code: string;
}

// --- STATE VÀ HÀM KHỞI TẠO (Giữ nguyên) ---

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  twoFactorEnabled: boolean; // Trường này dường như không được dùng, nhưng giữ nguyên
  loading: boolean;
  error: string | null;
}

const getInitialUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  twoFactorEnabled: false,
  loading: false,
  error: null,
};

// --- CẬP NHẬT ASYNC THUNKS ---

/**
 * CẬP NHẬT: `login` thunk
 * - Chấp nhận LoginPayload (bao gồm captchaToken)
 * - Xử lý lỗi 2FA rõ ràng bằng rejectWithValue
 */
export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { dispatch, rejectWithValue }) => {
    try {
      // Gọi authService.login với payload object (cần cập nhật authService.ts)
      // Giả sử authService.login đã được cập nhật để nhận object
      const response = await authService.login(payload);
      dispatch(fetchPermissions() as any);
      return response;
    } catch (error: any) {
      // Xử lý lỗi 2FA và các lỗi khác
      if (error.message === 'REQUIRE_2FA') {
        return rejectWithValue({ message: 'REQUIRE_2FA' });
      }
      return rejectWithValue({ message: error.message || 'Đăng nhập thất bại' });
    }
  }
);

/**
 * MỚI: `requestRegistration` thunk (Bước 1: Gửi OTP)
 * Thunk này chỉ xử lý loading/error, không đăng nhập.
 */
export const requestRegistration = createAsyncThunk(
  'auth/requestRegistration',
  async (payload: RequestRegistrationPayload, { rejectWithValue }) => {
    try {
      // Gọi hàm service mới
      await authService.requestRegistration(payload.email, payload.password, payload.fullName);
      return; // Không trả về data, chỉ gửi mail
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Gửi mã thất bại' });
    }
  }
);

/**
 * MỚI: `verifyRegistration` thunk (Bước 2: Xác thực OTP và Đăng nhập)
 * Thunk này sẽ đăng nhập và lưu thông tin user.
 */
export const verifyRegistration = createAsyncThunk(
  'auth/verifyRegistration',
  async (payload: VerifyRegistrationPayload, { dispatch, rejectWithValue }) => {
    try {
      // Gọi hàm service mới
      const response = await authService.verifyRegistration(
        payload.email,
        payload.password,
        payload.fullName,
        payload.code
      );
      // Đăng nhập thành công, lấy quyền
      dispatch(fetchPermissions() as any);
      return response; // Trả về AuthResponse
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Xác thực thất bại' });
    }
  }
);


// `register` thunk (CŨ) đã bị xóa và thay thế bằng 2 thunk ở trên.


/**
 * CẬP NHẬT: `refreshToken` thunk
 * - Xử lý lỗi rõ ràng bằng rejectWithValue
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken(token);
      return response;
    } catch (error: any) {
       return rejectWithValue({ message: error.message || 'Phiên làm việc hết hạn' });
    }
  }
);

// --- CẬP NHẬT SLICE VÀ REDUCERS ---

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state, action: PayloadAction<void>) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.twoFactorEnabled = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- Hàm trợ giúp để lưu thông tin đăng nhập thành công ---
    const handleLoginSuccess = (state: AuthState, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.userId,
          email: action.payload.email,
          fullName: action.payload.fullName,
          role: action.payload.role as 'ADMIN' | 'USER' | 'VIEWER',
        };
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(state.user));
    };

    // --- Hàm trợ giúp để xử lý lỗi ---
    const handleGenericPending = (state: AuthState) => {
        state.loading = true;
        state.error = null;
    };

    const handleGenericRejected = (state: AuthState, action: any) => {
        state.loading = false;
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message || action.error.message || 'Đã xảy ra lỗi';
    };


    builder
      // Cập nhật Login
      .addCase(login.pending, handleGenericPending)
      .addCase(login.fulfilled, handleLoginSuccess) // Tái sử dụng logic
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string } | undefined;
        if (payload?.message === 'REQUIRE_2FA') {
            state.error = 'REQUIRE_2FA'; // Lỗi đặc biệt cho UI xử lý
        } else {
            state.error = payload?.message || action.error.message || 'Login failed';
        }
      })

      // Thêm Reducer cho requestRegistration (Bước 1)
      .addCase(requestRegistration.pending, handleGenericPending)
      .addCase(requestRegistration.fulfilled, (state) => {
          state.loading = false; // Đã gửi mail, hết loading
      })
      .addCase(requestRegistration.rejected, handleGenericRejected)

      // Thêm Reducer cho verifyRegistration (Bước 2)
      .addCase(verifyRegistration.pending, handleGenericPending)
      .addCase(verifyRegistration.fulfilled, handleLoginSuccess) // Đăng nhập thành công
      .addCase(verifyRegistration.rejected, handleGenericRejected)

      // Cập nhật RefreshToken (Thêm xử lý lỗi)
      .addCase(refreshToken.pending, (state) => {
          state.loading = true; // Báo loading khi refresh
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
          state.loading = false;
          state.accessToken = action.payload.accessToken;
          localStorage.setItem('accessToken', action.payload.accessToken);
      })
      .addCase(refreshToken.rejected, (state, action) => {
          state.loading = false;
          // Nếu refresh token thất bại, đăng xuất người dùng
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          const payload = action.payload as { message: string } | undefined;
          state.error = payload?.message || action.error.message || 'Phiên làm việc hết hạn';
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
