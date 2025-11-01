import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { budgetService } from '../../services/budgetService';
import { Budget, BudgetDto } from '../../types';

interface BudgetState {
  budgets: Budget[];
  alerts: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  alerts: [],
  loading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk('budget/fetchBudgets', async () => {
  const budgets = await budgetService.getAll();
  return budgets;
});

export const fetchAlerts = createAsyncThunk('budget/fetchAlerts', async () => {
  const alerts = await budgetService.getAlerts();
  return alerts;
});

export const createBudget = createAsyncThunk(
  'budget/createBudget',
  async (budget: BudgetDto) => {
    const newBudget = await budgetService.create(budget);
    return newBudget;
  }
);

export const updateBudget = createAsyncThunk(
  'budget/updateBudget',
  async ({ id, budget }: { id: number; budget: BudgetDto }) => {
    const updatedBudget = await budgetService.update(id, budget);
    return updatedBudget;
  }
);

export const deleteBudget = createAsyncThunk('budget/deleteBudget', async (id: number) => {
  await budgetService.delete(id);
  return id;
});

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
      })
      // Fetch alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch alerts';
      })
      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create budget';
      })
      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update budget';
      })
      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
        state.alerts = state.alerts.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete budget';
      });
  },
});

export const { clearError } = budgetSlice.actions;
export default budgetSlice.reducer;

