import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { walletService } from '../../services/walletService';
import { Wallet, WalletDto } from '../../types';

interface WalletState {
  wallets: Wallet[];
  defaultWallet: Wallet | null;
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallets: [],
  defaultWallet: null,
  loading: false,
  error: null,
};

export const fetchWallets = createAsyncThunk('wallet/fetchWallets', async () => {
  const wallets = await walletService.getAll();
  return wallets;
});

export const createWallet = createAsyncThunk(
  'wallet/createWallet',
  async (wallet: WalletDto) => {
    const newWallet = await walletService.create(wallet);
    return newWallet;
  }
);

export const updateWallet = createAsyncThunk(
  'wallet/updateWallet',
  async ({ id, wallet }: { id: number; wallet: WalletDto }) => {
    const updatedWallet = await walletService.update(id, wallet);
    return updatedWallet;
  }
);

export const deleteWallet = createAsyncThunk(
  'wallet/deleteWallet',
  async (id: number) => {
    await walletService.delete(id);
    return id;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wallets
      .addCase(fetchWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload;
        state.defaultWallet = action.payload.find((w) => w.isDefault) || null;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wallets';
      })
      // Create wallet
      .addCase(createWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets.push(action.payload);
        if (action.payload.isDefault) {
          state.defaultWallet = action.payload;
          state.wallets.forEach((w) => {
            if (w.id !== action.payload.id) {
              w.isDefault = false;
            }
          });
        }
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create wallet';
      })
      // Update wallet
      .addCase(updateWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWallet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.wallets.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.wallets[index] = action.payload;
        }
        if (action.payload.isDefault) {
          state.defaultWallet = action.payload;
          state.wallets.forEach((w) => {
            if (w.id !== action.payload.id) {
              w.isDefault = false;
            }
          });
        }
      })
      .addCase(updateWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update wallet';
      })
      // Delete wallet
      .addCase(deleteWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = state.wallets.filter((w) => w.id !== action.payload);
        if (state.defaultWallet?.id === action.payload) {
          state.defaultWallet = null;
        }
      })
      .addCase(deleteWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete wallet';
      });
  },
});

export const { clearError } = walletSlice.actions;
export default walletSlice.reducer;

