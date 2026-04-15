import { useState } from 'react'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import DashboardPage from './pages/dashboard'
import ProjectViewPage from './pages/projectview'
import SettingsPage from './pages/settings'
import Navbar from './components/navbar'
import ProtectedRoute from './components/protectedroute'
import { AuthProvider } from './context/authcontext'
import './app.css'

function RouterView({ currentPage, setCurrentPage }) {
  if (currentPage === 'home') {
    return <HomePage onLogin={() => setCurrentPage('login')} onSignup={() => setCurrentPage('signup')} />
  }

  if (currentPage === 'login') {
    return <LoginPage onSuccess={() => setCurrentPage('dashboard')} onSignup={() => setCurrentPage('signup')} />
  }

  if (currentPage === 'signup') {
    return <SignupPage onSuccess={() => setCurrentPage('dashboard')} />
  }

  if (currentPage === 'project') {
    return (
      <ProtectedRoute onNeedLogin={() => setCurrentPage('login')}>
        <ProjectViewPage />
      </ProtectedRoute>
    )
  }

  if (currentPage === 'settings') {
    return (
      <ProtectedRoute onNeedLogin={() => setCurrentPage('login')}>
        <SettingsPage onGoHome={() => setCurrentPage('home')} />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute onNeedLogin={() => setCurrentPage('login')}>
      <DashboardPage />
    </ProtectedRoute>
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
        <RouterView currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </AuthProvider>
  )
}
