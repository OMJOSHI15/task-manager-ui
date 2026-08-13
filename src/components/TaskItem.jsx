import { useState } from 'react';

// Step 5: "Implement update (PUT) and delete (DELETE) actions, each
// followed by a state update or re-fetch." Each task row owns its own
// edit-mode state and per-action pending/error flags, so one slow
// request doesn't block the rest of the list.
function TaskItem({ task, onUpdate, onDeleteRequest }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [saving, setSaving] = useState(false);
  const [togglingCompleted, setTogglingCompleted] = useState(false);
  const [error, setError] = useState(null);

  const isTemp = typeof task._id === 'string' && task._id.startsWith('temp-');

  function startEdit() {
    setTitle(task.title);
    setDescription(task.description);
    setError(null);
    setEditing(true);
  }

  async function saveEdit() {
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onUpdate(task._id, { title: title.trim(), description: description.trim() });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleCompleted() {
    setTogglingCompleted(true);
    try {
      await onUpdate(task._id, { completed: !task.completed });
    } catch {
      // toast already surfaces the failure; nothing extra to show inline
    } finally {
      setTogglingCompleted(false);
    }
  }

  return (
    <li className={`task-item${task.completed ? ' task-item--done' : ''}${isTemp ? ' task-item--pending' : ''}`}>
      <input
        type="checkbox"
        className="task-item__checkbox"
        checked={task.completed}
        onChange={toggleCompleted}
        disabled={togglingCompleted || isTemp}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'not completed' : 'completed'}`}
      />

      {editing ? (
        <div className="task-item__edit">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            aria-label="Edit task title"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            placeholder="Description"
            aria-label="Edit task description"
          />
          {error && <p className="task-item__error">⚠ {error}</p>}
          <div className="task-item__actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="task-item__body">
          <div className="task-item__text">
            <p className="task-item__title">{task.title}</p>
            {task.description && <p className="task-item__desc">{task.description}</p>}
            {isTemp && <span className="task-item__saving-tag">saving…</span>}
          </div>
          <div className="task-item__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={startEdit} disabled={isTemp}>
              Edit
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => onDeleteRequest(task)}
              disabled={isTemp}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default TaskItem;
