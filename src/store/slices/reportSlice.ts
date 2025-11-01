import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportService } from '../../services/reportService';
import { ReportSummary, CashflowDto } from '../../types';

interface ReportState {
  summary: ReportSummary | null;
  cashflow: CashflowDto[];
  loading: boolean;
  error: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

const initialState: ReportState = {
  summary: null,
  cashflow: [],
  loading: false,
  error: null,
  dateRange: {
    from: null,
    to: null,
  },
};

export const fetchSummary = createAsyncThunk(
  'report/fetchSummary',
  async ({ from, to }: { from?: Date; to?: Date }) => {
    const summary = await reportService.getSummary(from, to);
    return summary;
  }
);

export const fetchCashflow = createAsyncThunk(
  'report/fetchCashflow',
  async ({ from, to }: { from?: Date; to?: Date }) => {
    const cashflow = await reportService.getCashflow(from, to);
    return cashflow;
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setDateRange: (
      state,
      action: PayloadAction<{ from: Date | null; to: Date | null }>
    ) => {
      state.dateRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch summary
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch summary';
      })
      // Fetch cashflow
      .addCase(fetchCashflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCashflow.fulfilled, (state, action) => {
        state.loading = false;
        state.cashflow = action.payload;
      })
      .addCase(fetchCashflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cashflow';
      });
  },
});

export const { setDateRange, clearError } = reportSlice.actions;
export default reportSlice.reducer;

