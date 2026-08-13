// Practical 6: central place for the backend base URL and every call to
// task-manager-api. Every other component imports from here instead of
// hardcoding the URL, per the practical's "Common Mistakes" warning about
// inconsistent hardcoded URLs across files.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

// Turns a non-2xx response into a thrown Error with the API's own message
// (task-manager-api always returns { error: "..." } on failure), so
// callers can just try/catch instead of checking res.ok everywhere.
async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. a DELETE with no content) — that's fine
  }

  if (!res.ok) {
    const message = body?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return body;
}

export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`);
  return handleResponse(res);
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return handleResponse(res);
}

export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export { BASE_URL };
