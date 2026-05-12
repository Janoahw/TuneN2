import type { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ModerationPage from './pages/ModerationPage';
import ReportDetailPage from './pages/ReportDetailPage';
import SongReviewPage from './pages/SongReviewPage';
import FinancialsPage from './pages/FinancialsPage';
import PayoutDetailPage from './pages/PayoutDetailPage';
import ContentManagementPage from './pages/ContentManagementPage';
import SettingsPage from './pages/SettingsPage';

function hasAdminSession() {
  return Boolean(localStorage.getItem('adminToken'));
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  if (!hasAdminSession()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoginRoute() {
  if (hasAdminSession()) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute>
                <UserDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderation"
            element={
              <ProtectedRoute>
                <ModerationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:reportId"
            element={
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/songs/:songId"
            element={
              <ProtectedRoute>
                <SongReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financials"
            element={
              <ProtectedRoute>
                <FinancialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payouts/:withdrawalId"
            element={
              <ProtectedRoute>
                <PayoutDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content"
            element={
              <ProtectedRoute>
                <ContentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={hasAdminSession() ? '/' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}
