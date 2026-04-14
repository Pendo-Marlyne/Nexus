import { Avatar, AvatarFallback } from '../ui/avatar'
import type { Comment } from '../../types/comment'

interface CommentItemProps {
  comment: Comment
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback>{comment.authorUid.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">@{comment.authorUid.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-sm">{comment.body}</p>
    </article>
  )
}

