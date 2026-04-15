import { useAuth } from '../context/authcontext'

export default function Navbar({ currentPage, onNavigate }) {
  const { user } = useAuth()
  const guestPages = [
    { id: 'home', label: 'Home' },
    { id: 'login', label: 'Login' },
    { id: 'signup', label: 'Sign Up' },
  ]
  const appPages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'project', label: 'Project View' },
    { id: 'settings', label: 'Settings' },
  ]

  const pages = user ? appPages : guestPages

  return (
    <header className="navbar page-card">
      <div>
        <h1>Nexus</h1>
        <p>Work, together. In pink. ??</p>
      </div>
      <nav>
        {pages.map((page) => (
          <button
            key={page.id}
            className={currentPage === page.id ? 'active' : ''}
            onClick={() => onNavigate(page.id)}
          >
            {page.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
