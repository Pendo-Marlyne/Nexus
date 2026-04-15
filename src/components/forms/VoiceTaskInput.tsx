import { useEffect, useRef, useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { Mic, Square, Check, AlertTriangle } from 'lucide-react'
import { db } from '../../lib/firebase/client'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Waveform } from '../ui/Waveform'

interface VoiceTaskResult {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string | null
  assignedTo: string | null
}

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL ?? ''

export function VoiceTaskInput() {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0.2)
  const [preview, setPreview] = useState<VoiceTaskResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timeoutRef = useRef<number | null>(null)
  const levelTimerRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (levelTimerRef.current) window.clearInterval(levelTimerRef.current)
    timeoutRef.current = null
    levelTimerRef.current = null
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    clearTimers()
  }

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        void processAudio()
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
      timeoutRef.current = window.setTimeout(stopRecording, 30_000)
      levelTimerRef.current = window.setInterval(
        () => setAudioLevel(0.15 + Math.random() * 0.85),
        120
      )
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'Microphone permission denied or unavailable.'
      setError(message)
    }
  }

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const value = String(reader.result ?? '')
        resolve(value.split(',')[1] ?? '')
      }
      reader.onerror = () => reject(new Error('Failed to read audio data'))
      reader.readAsDataURL(blob)
    })

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return
    setProcessing(true)
    setError(null)
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const audioBase64 = await blobToBase64(audioBlob)

      const response = await fetch(`${FUNCTIONS_BASE_URL}/voiceToTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64 }),
      })
      if (!response.ok) throw new Error('AI voice processing failed')
      const result = (await response.json()) as VoiceTaskResult
      setPreview(result)
      setConfirmOpen(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to process voice input.')
    } finally {
      setProcessing(false)
    }
  }

  const createTask = async () => {
    if (!preview) return
    setProcessing(true)
    try {
      const now = new Date().toISOString()
      await addDoc(collection(db, 'tasks'), {
        agencyId: 'default-agency',
        projectId: 'general',
        title: preview.title,
        description: preview.description,
        status: 'backlog',
        priority: preview.priority,
        assigneeUid: preview.assignedTo,
        reviewerUid: null,
        dueDate: preview.dueDate,
        blockedReason: null,
        createdAt: now,
        updatedAt: now,
      })
      setConfirmOpen(false)
      setPreview(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to create task from voice.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Voice to task</h3>
      <p className="text-xs text-muted-foreground">
        Record up to 30 seconds. We transcribe and extract a structured task with AI.
      </p>
      <Waveform active={recording || processing} level={audioLevel} />

      <div className="flex flex-wrap items-center gap-2">
        {!recording ? (
          <Button onClick={() => void startRecording()} disabled={processing}>
            <Mic className="mr-2 h-4 w-4" />
            {processing ? 'Processing...' : 'Start recording'}
          </Button>
        ) : (
          <Button variant="outline" onClick={stopRecording}>
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        )}
      </div>

      {error ? (
        <p className="inline-flex items-center gap-2 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </p>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm extracted task</DialogTitle>
            <DialogDescription>Review and confirm before creating in Firestore.</DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Title:</strong> {preview.title}
              </p>
              <p>
                <strong>Description:</strong> {preview.description}
              </p>
              <p>
                <strong>Priority:</strong> {preview.priority}
              </p>
              <p>
                <strong>Due date:</strong> {preview.dueDate ?? 'None'}
              </p>
              <p>
                <strong>Assigned to:</strong> {preview.assignedTo ?? 'Unassigned'}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void createTask()} disabled={processing || !preview}>
              <Check className="mr-2 h-4 w-4" />
              {processing ? 'Creating...' : 'Create task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

