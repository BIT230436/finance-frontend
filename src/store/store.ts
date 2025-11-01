import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import permissionsReducer from './slices/permissionsSlice';
import walletReducer from './slices/walletSlice';
import transactionReducer from './slices/transactionSlice';
import categoryReducer from './slices/categorySlice';
import budgetReducer from './slices/budgetSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionsReducer,
    wallet: walletReducer,
    transaction: transactionReducer,
    category: categoryReducer,
    budget: budgetReducer,
    report: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

