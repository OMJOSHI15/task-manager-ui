import { useState } from 'react';

// Step 4 of the practical: "Build a task creation form that POSTs to
// /tasks and updates local state on success." Submission itself (and the
// optimistic update) is handled by the parent via onCreate — this
// component only owns its own input state and per-submit loading/error.
function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
          aria-label="Task title"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          aria-label="Task description"
        />
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add task'}
        </button>
      </div>
      {error && (
        <p className="task-form__error" role="alert">
          ⚠ {error}
        </p>
      )}
    </form>
  );
}

export default TaskForm;
