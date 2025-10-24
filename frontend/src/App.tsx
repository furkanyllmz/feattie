import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import DashboardHome from './pages/admin/DashboardHome';
import UsersPage from './pages/admin/UsersPage';
import TenantsPage from './pages/admin/TenantsPage';
import TenantSettingsPage from './pages/admin/TenantSettingsPage';
import ChatTestPage from './pages/admin/ChatTestPage';
import './App.css'

export function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/:tenantId/settings" element={<TenantSettingsPage />} />
          <Route path="chat-test" element={<ChatTestPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
