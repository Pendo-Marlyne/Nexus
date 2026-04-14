import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import LoginPage from './auth/login/page'
import SignupPage from './auth/signup/page'
import ResetPasswordPage from './auth/reset-password/page'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useAuthStore } from './lib/store/useAuthStore'

function AuthBootstrap({ children }) {
  const initAuthListener = useAuthStore((state) => state.initAuthListener)

  useEffect(() => {
    const unsubscribe = initAuthListener()
    return unsubscribe
  }, [initAuthListener])

  return children
}

function AuthLayout({ children }) {
  return (
    <div className="page-wrap" style={{ maxWidth: 520 }}>
      {children}
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <AuthLayout>
                <SignupPage />
              </AuthLayout>
            }
          />
          <Route
            path="/auth/reset-password"
            element={
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthBootstrap>
    </BrowserRouter>
  )
}

