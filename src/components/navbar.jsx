export default function Navbar({ currentPage, onNavigate }) {
  const pages = ['dashboard', 'login', 'signup', 'reset-password']

  return (
    <header className="navbar page-card">
      <h1>Nexus App</h1>
      <nav>
        {pages.map((page) => (
          <button
            key={page}
            className={currentPage === page ? 'active' : ''}
            onClick={() => onNavigate(page)}
          >
            {page}
          </button>
        ))}
      </nav>
    </header>
  )
}
