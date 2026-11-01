import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import OverviewPage from './pages/OverviewPage';
import RequestsPage from './pages/RequestsPage';
import NoticesPage from './pages/NoticesPage';
import FeedbackPage from './pages/FeedbackPage';
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { DepartmentsPage, PeoplePage } from './pages/ManagementPages';
import { useAuth } from './context/AuthContext';

function Protected({ children, roles }) { const { user, isLoading } = useAuth(); if (isLoading) return <p className="app-loading">Loading Campus Service Hub…</p>; if (!user) return <Navigate to="/login" replace />; if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />; return children; }

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<Protected><DashboardLayout /></Protected>}>
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/people" element={<Protected roles={['admin']}><PeoplePage /></Protected>} />
        <Route path="/departments" element={<Protected roles={['admin']}><DepartmentsPage /></Protected>} />
        <Route path="/analytics" element={<Protected roles={['admin']}><AnalyticsPage /></Protected>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
