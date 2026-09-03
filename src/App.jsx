import { useCallback, useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api';
import { useToast } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ConfirmDialog from './components/ConfirmDialog';
import AuthForm from './components/AuthForm';
import './App.css';

// Practical 7: everything below was the whole app before auth existed.
// It's now only rendered once a token is present — see the `App` export
// at the bottom, which gates it behind AuthForm.
function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const showToast = useToast();
  const { logout } = useAuth();

  // Step 7 of the practical: initial fetch on mount, populating state
  // from the database rather than hardcoded values.
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      // Practical 7: an expired/invalid token surfaces here as a 401 —
      // bounce back to the login form instead of showing a raw error.
      if (err.isAuthError) {
        logout();
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Supplementary problem: optimistic UI update for creation — the new
  // task appears in the list immediately (marked "saving…" via its temp
  // id), then gets swapped for the real server document, or removed with
  // an error toast if the request fails.
  async function handleCreate(taskInput) {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { ...taskInput, _id: tempId, completed: false };
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const created = await createTask(taskInput);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? created : t)));
      showToast(`"${created.title}" added.`, 'success');
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      showToast(`Couldn't add task: ${err.message}`, 'error');
      throw err; // let TaskForm know so it can keep the typed text around
    }
  }

  // Used for both the inline edit form and the completed-checkbox toggle.
  async function handleUpdate(id, updates) {
    try {
      const updated = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      showToast('Task updated.', 'success');
    } catch (err) {
      showToast(`Update failed: ${err.message}`, 'error');
      throw err;
    }
  }

  function handleDeleteRequest(task) {
    setDeleteTarget(task);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget._id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      showToast(`"${deleteTarget.title}" deleted.`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Task Manager</h1>
        <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
          Log out
        </button>
      </header>

      <main className="app__main">
        <TaskForm onCreate={handleCreate} />

        {loading && <Spinner label="Loading tasks…" />}
        {!loading && error && <ErrorMessage message={error} onRetry={loadTasks} />}

        {!loading && !error && (
          <>
            <div className="app__stats">
              {tasks.length} task{tasks.length === 1 ? '' : 's'} · {completedCount} completed
            </div>
            <TaskList tasks={tasks} onUpdate={handleUpdate} onDeleteRequest={handleDeleteRequest} />
          </>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this task?"
        message={deleteTarget ? `"${deleteTarget.title}" will be permanently removed.` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        busy={deleting}
      />
    </div>
  );
}

// Practical 7: no router in this app (confirmed absent from package.json),
// so the login gate is just a conditional render rather than a new route.
function App() {
  const { isAuthed } = useAuth();
  if (!isAuthed) {
    return (
      <div className="app app--auth">
        <main className="app__main">
          <AuthForm />
        </main>
      </div>
    );
  }
  return <TaskDashboard />;
}

export default App;
