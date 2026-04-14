import * as ToastPrimitives from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const ToastProvider = ToastPrimitives.Provider
export const ToastViewport = ToastPrimitives.Viewport

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg',
  {
    variants: {
      variant: {
        default: 'border bg-card text-card-foreground',
        destructive: 'border-red-500 bg-red-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export const Toast = ({
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>) => (
  <ToastPrimitives.Root className={cn(toastVariants({ variant }), className)} {...props} />
)

export const ToastAction = ToastPrimitives.Action

export function ToastClose(props: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>) {
  return (
    <ToastPrimitives.Close className="rounded-md p-1 text-foreground/50 hover:text-foreground" {...props}>
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
}

export function ToastTitle(props: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>) {
  return <ToastPrimitives.Title className="text-sm font-semibold" {...props} />
}

export function ToastDescription(
  props: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
) {
  return <ToastPrimitives.Description className="text-sm opacity-90" {...props} />
}

