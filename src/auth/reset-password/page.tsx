'use client'

import { sendPasswordResetEmail } from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { auth } from '../../lib/firebase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const resetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type ResetFormValues = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email'
      toast.error(message)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          <p>{form.formState.errors.email?.message}</p>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Sending...' : 'Send reset email'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

