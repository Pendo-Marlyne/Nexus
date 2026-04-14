import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg'
type SpinnerColor = 'primary' | 'muted' | 'white'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  fullscreen?: boolean
  label?: string
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
}

const colorMap: Record<SpinnerColor, string> = {
  primary: 'text-primary',
  muted: 'text-muted-foreground',
  white: 'text-white',
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullscreen = false,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  const spinner = <Loader2 className={cn('animate-spin', sizeMap[size], colorMap[color])} aria-label={label} />
  if (!fullscreen) return spinner

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-card p-4">{spinner}</div>
    </div>
  )
}

