import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedManageRoute from './components/ProtectedManageRoute';
import AppWrapper from './components/AppWrapper';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import OAuthCallback from './pages/Auth/OAuthCallback';
import AuthError from './pages/Auth/AuthError';

// Main pages
import Dashboard from './pages/Dashboard/Dashboard';
import WalletList from './pages/Wallet/WalletList';
import WalletDetail from './pages/Wallet/WalletDetail';
import TransactionList from './pages/Transaction/TransactionList';
import TransactionDetail from './pages/Transaction/TransactionDetail';
import RecurringTransactionList from './pages/Transaction/RecurringTransactionList';
import CategoryList from './pages/Category/CategoryList';
import BudgetList from './pages/Budget/BudgetList';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import LoginHistory from './pages/Settings/LoginHistory';
import Feedback from './pages/Feedback/Feedback';
import GoalList from './pages/Goals/GoalList';
import SharedWallets from './pages/Wallet/SharedWallets';
import UserManagement from './pages/Admin/UserManagement';
import ActivityLogs from './pages/Admin/ActivityLogs';
import TwoFactorSetup from './pages/Auth/TwoFactorSetup';
import ExpenseSplitList from './pages/ExpenseSplit/ExpenseSplitList';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <AppWrapper>
        <Router>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* OAuth2 callback routes - backend redirects to /auth/callback or /auth/error */}
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/auth/error" element={<AuthError />} />
          {/* Legacy route for backward compatibility */}
          <Route path="/oauth2/callback" element={<OAuthCallback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallets"
            element={
              <ProtectedRoute>
                <WalletList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallets/:id"
            element={
              <ProtectedRoute>
                <WalletDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id"
            element={
              <ProtectedRoute>
                <TransactionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurring-transactions"
            element={
              <ProtectedManageRoute>
                <RecurringTransactionList />
              </ProtectedManageRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedManageRoute>
                <CategoryList />
              </ProtectedManageRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedManageRoute>
                <BudgetList />
              </ProtectedManageRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedManageRoute>
                <Settings />
              </ProtectedManageRoute>
            }
          />
          <Route
            path="/settings/2fa"
            element={
              <ProtectedManageRoute>
                <TwoFactorSetup />
              </ProtectedManageRoute>
            }
          />
          <Route
            path="/settings/login-history"
            element={
              <ProtectedManageRoute>
                <LoginHistory />
              </ProtectedManageRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedManageRoute>
                <Feedback />
              </ProtectedManageRoute>
            }
          />
              <Route
                path="/goals"
                element={
                  <ProtectedManageRoute>
                    <GoalList />
                  </ProtectedManageRoute>
                }
              />
              <Route
                path="/wallets/shared"
                element={
                  <ProtectedManageRoute>
                    <SharedWallets />
                  </ProtectedManageRoute>
                }
              />
              <Route
                path="/expense-split"
                element={
                  <ProtectedManageRoute>
                    <ExpenseSplitList />
                  </ProtectedManageRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedAdminRoute>
                    <UserManagement />
                  </ProtectedAdminRoute>
                }
              />
          <Route
            path="/admin/logs"
            element={
              <ProtectedAdminRoute>
                <ActivityLogs />
              </ProtectedAdminRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      </AppWrapper>
    </Provider>
  );
}

export default App;
