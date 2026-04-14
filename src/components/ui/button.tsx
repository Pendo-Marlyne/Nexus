import * as React from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'default' | 'outline' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClass: Record<ButtonVariant, string> = {
  default: 'btn',
  outline: 'btn ghost',
  ghost: 'btn ghost',
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return <button className={cn(variantClass[variant], className)} {...props} />
}

