import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

interface ConfirmationDialogProps {
  triggerLabel: string
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => Promise<void> | void
  loading?: boolean
  destructive?: boolean
}

export function ConfirmationDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  destructive = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={destructive ? 'outline' : 'default'}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">{cancelLabel}</Button>
          <Button onClick={() => void onConfirm()} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

