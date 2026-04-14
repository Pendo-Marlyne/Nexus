import { useState } from 'react'
import { X } from 'lucide-react'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder = 'Add tag and press Enter' }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const addTag = (tag: string) => {
    const normalized = tag.trim()
    if (!normalized || value.includes(normalized)) return
    onChange([...value, normalized])
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.preventDefault()
          addTag(draft)
          setDraft('')
        }}
      />
    </div>
  )
}

