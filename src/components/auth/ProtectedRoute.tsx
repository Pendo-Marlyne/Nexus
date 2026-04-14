'use client'

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
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
  const { initializing, userProfile, hasRole } = useAuthStore((state) => state)

  if (initializing) {
    return (
      <div className="card">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!userProfile) return <Navigate to={redirectTo} replace />
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

