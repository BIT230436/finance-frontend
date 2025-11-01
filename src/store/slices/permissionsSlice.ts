import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { PermissionsResponse, UserPermissions } from '../../types';

interface PermissionsState {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  permissions: null,
  loading: false,
  error: null,
};

// Async thunk to fetch permissions
export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async () => {
    const response = await authService.getPermissions();
    return response.features;
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissions: (state) => {
      state.permissions = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch permissions';
      });
  },
});

export const { clearPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;

