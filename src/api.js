// Practical 6: central place for the backend base URL and every call to
// task-manager-api. Every other component imports from here instead of
// hardcoding the URL, per the practical's "Common Mistakes" warning about
// inconsistent hardcoded URLs across files.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

// Practical 7: JWT is kept in localStorage so it survives a page refresh.
// One key, read/written only from here — everything else goes through
// getToken/setToken/clearToken instead of touching localStorage directly.
const TOKEN_KEY = 'taskmanager_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Turns a non-2xx response into a thrown Error with the API's own message
// (task-manager-api always returns { error: "..." } on failure), so
// callers can just try/catch instead of checking res.ok everywhere. A 401
// also gets an `.isAuthError` flag so App.jsx can tell "bad request" apart
// from "your session is gone, log in again" and route to the login form.
async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. a DELETE with no content) — that's fine
  }

  if (!res.ok) {
    const message = body?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    if (res.status === 401) error.isAuthError = true;
    throw error;
  }

  return body;
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(task),
  });
  return handleResponse(res);
}

export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export { BASE_URL };
