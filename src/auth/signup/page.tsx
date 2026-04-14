'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuid } from 'uuid'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { useAuthStore } from '../../lib/store/useAuthStore'
import { db } from '../../lib/firebase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Skeleton } from '../../components/ui/skeleton'

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const { signUpWithEmail, signInWithGoogle, loading, error, userProfile } = useAuthStore()
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const createDefaultAgency = async (uid: string, ownerName: string) => {
    const agencyId = uuid()
    const now = new Date().toISOString()
    await setDoc(doc(db, 'agencies', agencyId), {
      id: agencyId,
      name: `${ownerName}'s Agency`,
      ownerUid: uid,
      createdAt: now,
      updatedAt: now,
    })
    await updateDoc(doc(db, 'users', uid), {
      agencyId,
      updatedAt: now,
    })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await signUpWithEmail({
      name: values.name,
      email: values.email,
      password: values.password,
    })
    const uid = useAuthStore.getState().authUid
    if (uid) await createDefaultAgency(uid, values.name)
    window.location.href = '/dashboard'
  })

  const onGoogleSignup = async () => {
    await signInWithGoogle()
    const profile = useAuthStore.getState().userProfile
    if (profile && !profile.agencyId) {
      await createDefaultAgency(profile.uid, profile.displayName || 'New Owner')
    }
    window.location.href = '/dashboard'
  }

  if (loading && !userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creating your workspace...</CardTitle>
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
        <CardTitle>Create your Helix account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register('name')} />
          <p>{form.formState.errors.name?.message}</p>

          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          <p>{form.formState.errors.email?.message}</p>

          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register('password')} />
          <p>{form.formState.errors.password?.message}</p>

          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
          <p>{form.formState.errors.confirmPassword?.message}</p>

          {error ? <p className="danger">{error}</p> : null}
          <Button type="submit" disabled={loading || form.formState.isSubmitting}>
            {loading || form.formState.isSubmitting ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="space" />
        <Button type="button" variant="outline" onClick={onGoogleSignup} disabled={loading}>
          Sign up with Google
        </Button>
        <div className="space" />
        <a href="/auth/login">Already have an account? Log in</a>
      </CardContent>
    </Card>
  )
}

