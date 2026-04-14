import { TASK_STATES, VALID_TASK_TRANSITIONS } from '../../types/task'

export function TaskBoard({ tasks, onMoveTask }) {
  return (
    <section className="card">
      <h3>Task Board</h3>
      <div className="task-grid">
        {tasks.map((task) => (
          <article className="card" key={task.id}>
            <div className="layout-row">
              <strong>{task.id}</strong>
              <span className="pill">{task.state}</span>
            </div>
            <p>{task.title}</p>
            <div className="space" />
            <small>Owner: {task.assignee || 'Unassigned'}</small>
            <div className="space" />
            <select
              value={task.state}
              onChange={(event) => onMoveTask(task.id, event.target.value)}
            >
              {TASK_STATES.map((state) => {
                const legal = state === task.state || VALID_TASK_TRANSITIONS[task.state]?.includes(state)
                return (
                  <option key={state} value={state} disabled={!legal}>
                    {state}
                  </option>
                )
              })}
            </select>
          </article>
        ))}
      </div>
    </section>
  )
}
