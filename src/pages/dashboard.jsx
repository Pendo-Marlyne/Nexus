import { useMemo, useState } from 'react'
import SkillsSection from '../components/skillssection'

const makeTask = (text, priority, files = []) => ({
  id: crypto.randomUUID(),
  text,
  priority,
  complete: false,
  files,
})

function playPop() {
  const context = new AudioContext()
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'triangle'
  osc.frequency.value = 320
  gain.gain.value = 0.14
  osc.connect(gain)
  gain.connect(context.destination)
  osc.start()
  osc.frequency.exponentialRampToValueAtTime(520, context.currentTime + 0.1)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.14)
  osc.stop(context.currentTime + 0.14)
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState([
    makeTask('Check project updates', 'normal'),
    makeTask('Share team standup note', 'important'),
    makeTask('Fix client blocker', 'urgent'),
  ])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState('normal')
  const [search, setSearch] = useState('')
  const [confettiOn, setConfettiOn] = useState(true)
  const [burst, setBurst] = useState(0)
  const [dragIndex, setDragIndex] = useState(-1)
  const [newFiles, setNewFiles] = useState([])

  const messages = ['Design review at 2 PM', 'Client sent logo feedback']

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tasks
    return tasks.filter((task) => {
      const fileNames = task.files.map((file) => file.name.toLowerCase()).join(' ')
      return task.text.toLowerCase().includes(q) || fileNames.includes(q)
    })
  }, [search, tasks])

  const filesFound = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return tasks.flatMap((task) => task.files.filter((file) => file.name.toLowerCase().includes(q)))
  }, [search, tasks])

  const completedCount = tasks.filter((task) => task.complete).length
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks((current) => [...current, makeTask(newTask.trim(), priority, newFiles)])
    setNewTask('')
    setNewFiles([])
  }

  const voiceInput = () => {
    const API = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!API) return
    const recognition = new API()
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript ?? ''
      if (spoken) setNewTask(spoken)
    }
    recognition.start()
  }

  const toggleTask = (id) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, complete: !task.complete } : task)))
    playPop()
    if (confettiOn) {
      setBurst(Date.now())
    }
  }

  const moveTask = (fromIndex, toIndex) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
    setTasks((current) => {
      const clone = [...current]
      const [moved] = clone.splice(fromIndex, 1)
      clone.splice(toIndex, 0, moved)
      return clone
    })
  }

  const priorityClass = {
    normal: 'priority-normal',
    important: 'priority-important',
    urgent: 'priority-urgent',
  }

  return (
    <main className="layout-stack">
      <section className="page-card">
        <h2>Your tasks. Your messages. Your day.</h2>
        <p>Encouraging mode on. You are doing amazing.</p>
      </section>

      <section className="page-card">
        <h3>Task Manager ?</h3>
        <div className="task-input-row">
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Type a new task" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="normal">Normal (pink)</option>
            <option value="important">Important (gold)</option>
            <option value="urgent">Urgent (red + sparkles)</option>
          </select>
          <input type="file" multiple onChange={(e) => setNewFiles(Array.from(e.target.files || []))} />
          <button onClick={voiceInput}>Speak</button>
          <button onClick={addTask}>Add</button>
        </div>

        <label className="switch-row">
          <input type="checkbox" checked={confettiOn} onChange={(e) => setConfettiOn(e.target.checked)} />
          Optional confetti animation
        </label>

        {confettiOn && burst > 0 && <div key={burst} className="confetti">???????</div>}

        <ul className="task-list">
          {tasks.map((task, index) => (
            <li
              key={task.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => moveTask(dragIndex, index)}
              className={`task-item ${priorityClass[task.priority]}`}
            >
              <div>
                <strong>{task.text}</strong>
                <p>{task.priority}{task.priority === 'urgent' ? ' ?' : ''}</p>
                {task.files.length > 0 && (
                  <div className="file-preview-grid">
                    {task.files.map((file) => (
                      <div key={`${task.id}-${file.name}`} className="file-chip">
                        <span>{file.name}</span>
                        {file.type.startsWith('image/') && (
                          <img src={URL.createObjectURL(file)} alt={file.name} className="inline-image" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => toggleTask(task.id)}>{task.complete ? 'Undo' : 'Complete'}</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-card">
        <h3>Filing Cabinet ??</h3>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files, messages, tasks" />
        <p>Messages: {messages.filter((msg) => msg.toLowerCase().includes(search.toLowerCase())).join(' | ') || 'No matches'}</p>
        <p>Tasks found: {filteredTasks.length}</p>
        <p>Files found: {filesFound.map((file) => file.name).join(', ') || 'None'}</p>
      </section>

      <SkillsSection progress={progress} />
    </main>
  )
}
