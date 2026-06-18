import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { LedgerProvider } from './hooks/useLedger'
import { ProtectedRoute, PublicRoute } from './components/RouteGuard'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreditsPage } from './pages/CreditsPage'
import { DebitsPage } from './pages/DebitsPage'
import { ProfilePage } from './pages/ProfilePage'
 
export default function App() {
  return (
    <AuthProvider>
      <LedgerProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Onboarding/Auth Steps */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Workspace Ledger Pages */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="/debits" element={<DebitsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Direct fallback redirecting to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </LedgerProvider>
    </AuthProvider>
  )
}
