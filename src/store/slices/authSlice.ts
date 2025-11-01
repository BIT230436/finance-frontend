import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { AuthResponse, User } from '../../types';
import { fetchPermissions, clearPermissions } from './permissionsSlice';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  twoFactorEnabled: boolean;
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

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    const response = await authService.login(email, password);
    // Fetch permissions after successful login
    dispatch(fetchPermissions() as any);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({
    email,
    password,
    fullName,
  }: {
    email: string;
    password: string;
    fullName: string;
  }, { dispatch }) => {
    const response = await authService.register(email, password, fullName);
    // Fetch permissions after successful registration
    dispatch(fetchPermissions() as any);
    return response;
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (token: string) => {
    const response = await authService.refreshToken(token);
    return response;
  }
);

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
      // Clear permissions will be handled by permissionsSlice in App.tsx or middleware
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
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
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
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;

