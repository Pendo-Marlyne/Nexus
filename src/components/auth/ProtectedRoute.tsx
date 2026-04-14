'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import type { UserRole } from '../../types/user'
import { useAuthStore } from '../../lib/store/useAuthStore'
import { Skeleton } from '../ui/skeleton'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: UserRole[]
  redirectTo?: string
}

/**
 * Guard component for auth + role protection in client-side routes.
 */
export function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { initAuthListener, initializing, userProfile, hasRole } = useAuthStore((state) => state)

  useEffect(() => {
    const unsubscribe = initAuthListener()
    return unsubscribe
  }, [initAuthListener])

  useEffect(() => {
    if (initializing) return
    if (!userProfile) {
      window.location.href = redirectTo
      return
    }
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      window.location.href = '/dashboard'
    }
  }, [initializing, userProfile, requiredRoles, hasRole, redirectTo])

  if (initializing) {
    return (
      <div className="card">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!userProfile) return null
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) return null
  return <>{children}</>
}

