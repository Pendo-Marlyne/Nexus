'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../../lib/store/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Skeleton } from '../../components/ui/skeleton'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, loading, error, clearError, userProfile } = useAuthStore()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (userProfile) window.location.href = '/dashboard'
  }, [userProfile])

  const onSubmit = form.handleSubmit(async (values) => {
    clearError()
    await signInWithEmail(values.email, values.password)
    window.location.href = '/dashboard'
  })

  const onGoogle = async () => {
    clearError()
    await signInWithGoogle()
    window.location.href = '/dashboard'
  }

  if (loading && !form.formState.isSubmitting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Signing you in...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in to Helix</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          <p>{form.formState.errors.email?.message}</p>

          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register('password')} />
          <p>{form.formState.errors.password?.message}</p>

          {error ? <p className="danger">{error}</p> : null}
          <Button type="submit" disabled={loading || form.formState.isSubmitting}>
            {loading || form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="space" />
        <Button type="button" variant="outline" onClick={onGoogle} disabled={loading}>
          Sign in with Google
        </Button>
        <div className="space" />
        <a href="/auth/signup">Create account</a> · <a href="/auth/reset-password">Forgot password?</a>
      </CardContent>
    </Card>
  )
}

