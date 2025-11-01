import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService } from '../../services/transactionService';
import { Transaction, TransactionDto, TransferRequest } from '../../types';

interface TransactionFilters {
  walletId?: number;
  categoryId?: number;
  type?: 'INCOME' | 'EXPENSE';
  from?: Date;
  to?: Date;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
  filters: {},
};

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (filters?: TransactionFilters) => {
    const transactions = await transactionService.getAll(filters);
    return transactions;
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (transaction: TransactionDto) => {
    const newTransaction = await transactionService.create(transaction);
    return newTransaction;
  }
);

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ id, transaction }: { id: number; transaction: TransactionDto }) => {
    const updatedTransaction = await transactionService.update(id, transaction);
    return updatedTransaction;
  }
);

export const deleteTransaction = createAsyncThunk(
  'transaction/deleteTransaction',
  async (id: number) => {
    await transactionService.delete(id);
    return id;
  }
);

export const transferBetweenWallets = createAsyncThunk(
  'transaction/transfer',
  async (transferData: TransferRequest) => {
    await transactionService.transfer(transferData);
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create transaction';
      })
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update transaction';
      })
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete transaction';
      })
      // Transfer
      .addCase(transferBetweenWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferBetweenWallets.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(transferBetweenWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to transfer';
      });
  },
});

export const { setFilters, clearFilters, clearError } = transactionSlice.actions;
export default transactionSlice.reducer;

