import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Practical 7: single form that toggles between login and register, styled
// with the same .task-form / .btn classes TaskForm already uses so it
// doesn't look bolted on.
export default function AuthForm() {
  const { login, register } = useAuth();
  const showToast = useToast();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      showToast(mode === 'login' ? 'Welcome back!' : 'Account created.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setError(null);
  }

  return (
    <div className="auth-card">
      <div className="auth-badge" aria-hidden="true">
        ✓
      </div>
      <h1 className="auth-card__title">Task Manager</h1>
      <p className="auth-card__subtitle">Sign in to view and manage your tasks.</p>

      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={`auth-tabs__tab ${mode === 'login' ? 'auth-tabs__tab--active' : ''}`}
          onClick={() => switchMode('login')}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={`auth-tabs__tab ${mode === 'register' ? 'auth-tabs__tab--active' : ''}`}
          onClick={() => switchMode('register')}
        >
          Register
        </button>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="task-form__row">
            <label htmlFor="auth-name">Name</label>
            <input
              id="auth-name"
              type="text"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="task-form__row">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="task-form__row">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && <p className="task-form__error">⚠ {error}</p>}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
