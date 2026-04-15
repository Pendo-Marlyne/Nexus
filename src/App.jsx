import { useState } from 'react'
import Navbar from './components/navbar'
import ProtectedRoute from './components/protectedroute'
import { AuthProvider } from './context/authcontext'
import DashboardPage from './pages/dashboard'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import ResetPasswordPage from './pages/resetpassword'
import './app.css'

function PageSwitcher({ currentPage }) {
  if (currentPage === 'login') return <LoginPage />
  if (currentPage === 'signup') return <SignupPage />
  if (currentPage === 'reset-password') return <ResetPasswordPage />

  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
        <PageSwitcher currentPage={currentPage} />
      </div>
    </AuthProvider>
  )
}
