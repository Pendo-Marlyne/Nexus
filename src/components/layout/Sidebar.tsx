import { LayoutDashboard, FolderKanban, CheckSquare, Users, ArrowLeftRight, BarChart3 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard?tab=projects', label: 'Projects', icon: FolderKanban },
  { to: '/dashboard?tab=tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/dashboard?tab=leads', label: 'Leads', icon: Users },
  { to: '/dashboard?tab=handoffs', label: 'Handoffs', icon: ArrowLeftRight },
  { to: '/dashboard?tab=analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Helix</h2>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted',
                  isActive && 'bg-muted'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

