import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import type { Lead } from '../../types/lead'

interface LeadDetailModalProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadDetailModal({ lead, open, onOpenChange }: LeadDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lead?.company || lead?.name || 'Lead details'}</DialogTitle>
          <DialogDescription>Review AI score and suggested next action.</DialogDescription>
        </DialogHeader>
        {lead ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>Stage:</strong> {lead.status}
            </p>
            <p>
              <strong>Score:</strong> {lead.score}
            </p>
            <p>
              <strong>Reasoning:</strong> {(lead as Lead & { aiReasoning?: string }).aiReasoning ?? 'Not scored yet.'}
            </p>
            <p>
              <strong>Suggested next step:</strong>{' '}
              {(lead as Lead & { suggestedNextStep?: string }).suggestedNextStep ?? 'No suggestion yet.'}
            </p>
            <p>
              <strong>Close probability:</strong>{' '}
              {(lead as Lead & { closeProbability?: number }).closeProbability ?? 0}%
            </p>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

