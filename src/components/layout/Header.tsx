import { Bell, Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface HeaderProps {
  title?: string
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search..." />
        </div>
        <Button variant="outline">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

