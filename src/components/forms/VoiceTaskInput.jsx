import { useState } from 'react'
import { transcriptToTasks } from '../../lib/utils/voiceTaskParser'

const EXAMPLE =
  "Hey, I need to remind myself to check Sarah's Figma file for the Acme landing page by 3pm today. Also, we should probably bump up the priority on that logo revision because the client emailed asking for it. Oh and can someone review the proposal draft before I send it tomorrow morning?"

export function VoiceTaskInput() {
  const [transcript, setTranscript] = useState(EXAMPLE)
  const [result, setResult] = useState(null)

  const parse = () => {
    setResult(transcriptToTasks(transcript))
  }

  return (
    <section className="card">
      <h3>Voice to Structured Tasks</h3>
      <textarea
        rows={7}
        value={transcript}
        onChange={(event) => setTranscript(event.target.value)}
      />
      <div className="space" />
      <button className="btn" onClick={parse}>Parse Transcript</button>
      {result && (
        <>
          <div className="space" />
          <pre className="card">{JSON.stringify(result, null, 2)}</pre>
        </>
      )}
    </section>
  )
}
