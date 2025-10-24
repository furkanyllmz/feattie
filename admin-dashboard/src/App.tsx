import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '../components/admin-layout'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { Toaster } from '../components/ui/toaster'
import LoginPage from '../app/auth/login/page'
import RegisterPage from '../app/auth/register/page'
import LandingPage from '../app/landing/page'
import DashboardPage from '../app/page'
import TenantsPage from '../app/tenants/page'
import TenantSettingsPage from '../app/tenants/[id]/settings/page'
import WidgetSettingsPage from '../app/tenant-settings/page'
import UsersPage from '../app/users/page'
import SettingsPage from '../app/settings/page'
import ChatPage from '../app/chat/page'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // Check admin-only routes
  if (adminOnly && user.role !== 1) {
    return <Navigate to="/" replace />
  }

  const userForLayout = {
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    email: user.email,
    role: user.role,
  }

  return <AdminLayout user={userForLayout}>{children}</AdminLayout>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenants"
            element={
              <ProtectedRoute adminOnly={true}>
                <TenantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenants/:id/settings"
            element={
              <ProtectedRoute adminOnly={true}>
                <TenantSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant-settings"
            element={
              <ProtectedRoute>
                <WidgetSettingsPage />
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
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
