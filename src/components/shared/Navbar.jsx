import { NexusLogo } from './NexusLogo'

export function Navbar({ activeTab, tabs, onTabChange }) {
  return (
    <header className="site-nav">
      <NexusLogo />
      <nav>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="layout-row">
        <button className="btn ghost nav-link">Log In</button>
        <button className="btn">Book Demo</button>
      </div>
    </header>
  )
}
