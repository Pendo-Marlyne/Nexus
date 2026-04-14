import { useState } from 'react'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { addDoc, collection } from 'firebase/firestore'
import { Button } from '../ui/button'
import { storage, db } from '../../lib/firebase/client'

interface FileAttachmentProps {
  taskId: string
  userUid?: string
}

export function FileAttachment({ taskId, userUid = 'current-user' }: FileAttachmentProps) {
  const [pending, setPending] = useState(false)

  const onUpload = async (file: File) => {
    setPending(true)
    try {
      const path = `tasks/${taskId}/attachments/${Date.now()}-${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      const now = new Date().toISOString()
      await addDoc(collection(db, `tasks/${taskId}/attachments`), {
        name: file.name,
        size: file.size,
        contentType: file.type,
        path,
        downloadURL,
        uploadedBy: userUid,
        createdAt: now,
      })
      await addDoc(collection(db, `tasks/${taskId}/activity`), {
        type: 'attachment_uploaded',
        message: `Uploaded ${file.name}`,
        actorUid: userUid,
        createdAt: now,
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Attachments</h3>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
        <input
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void onUpload(file)
          }}
        />
        <span>{pending ? 'Uploading...' : 'Upload file'}</span>
      </label>
      <div className="mt-2">
        <Button variant="outline" size="sm" onClick={() => window.alert('Attachment list can be shown here')}>
          View attachments
        </Button>
      </div>
    </section>
  )
}

