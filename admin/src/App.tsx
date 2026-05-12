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

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
          <Route path="/moderation" element={<ModerationPage />} />
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
          <Route path="/songs/:songId" element={<SongReviewPage />} />
          <Route path="/financials" element={<FinancialsPage />} />
          <Route path="/payouts/:withdrawalId" element={<PayoutDetailPage />} />
          <Route path="/content" element={<ContentManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}
