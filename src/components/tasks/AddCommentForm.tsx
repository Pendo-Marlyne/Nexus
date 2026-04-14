import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { db } from '../../lib/firebase/client'
import type { Comment } from '../../types/comment'

interface AddCommentFormProps {
  taskId: string
  agencyId: string
  currentUserUid?: string
  onOptimisticComment: (comment: Comment) => void
}

export function AddCommentForm({
  taskId,
  agencyId,
  currentUserUid = 'current-user',
  onOptimisticComment,
}: AddCommentFormProps) {
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async () => {
    const text = body.trim()
    if (!text) return
    setPending(true)
    const now = new Date().toISOString()
    const optimisticComment: Comment = {
      id: `temp-${crypto.randomUUID()}`,
      agencyId,
      resourceType: 'task',
      resourceId: taskId,
      authorUid: currentUserUid,
      body: text,
      mentions: [],
      createdAt: now,
      updatedAt: now,
    }
    onOptimisticComment(optimisticComment)
    setBody('')
    try {
      await addDoc(collection(db, `tasks/${taskId}/comments`), {
        ...optimisticComment,
        id: undefined,
      })
      await addDoc(collection(db, `tasks/${taskId}/activity`), {
        type: 'comment_added',
        message: 'Added a comment',
        actorUid: currentUserUid,
        createdAt: now,
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <Input
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write a comment..."
      />
      <Button onClick={() => void submit()} disabled={pending || !body.trim()}>
        {pending ? 'Posting...' : 'Post comment'}
      </Button>
    </div>
  )
}

