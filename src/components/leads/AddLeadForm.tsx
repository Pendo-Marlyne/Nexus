import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { db } from '../../lib/firebase/client'
import type { LeadStatus } from '../../types/lead'

interface AddLeadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddLeadForm({ open, onOpenChange }: AddLeadFormProps) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    budget: '',
  })
  const [pending, setPending] = useState(false)

  const submit = async () => {
    if (!form.name || !form.email) return
    setPending(true)
    try {
      const now = new Date().toISOString()
      await addDoc(collection(db, 'leads'), {
        ...form,
        budget: Number(form.budget) || 0,
        status: 'new' as LeadStatus,
        score: 0,
        notes: '',
        ownerUid: null,
        aiReasoning: '',
        suggestedNextStep: '',
        closeProbability: 0,
        agencyId: 'default-agency',
        createdAt: now,
        updatedAt: now,
      })
      setForm({ name: '', company: '', email: '', budget: '' })
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>Manually add a new lead into your funnel.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Company</Label>
            <Input value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Budget</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={pending}>
            {pending ? 'Adding...' : 'Add lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

