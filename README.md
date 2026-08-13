# Task Manager UI

The React frontend for `task-manager-api`, built as part of AWDF
**Practical 6: Full Stack Integration React + Node + MongoDB**. It's a
standalone app with its own repo, kept separate from `task-manager-api`
(backend) and `student-portfolio` (personal site) per the practical's
"clearly separating frontend and backend" deliverable.

## Architecture

```
React Frontend (localhost:5173)
  │  fetch calls (src/api.js)
  ▼
Express Backend (localhost:5050 locally — see task-manager-api's README)
  │  Mongoose
  ▼
MongoDB Database
```

Flow: UI form → `POST /tasks` → MongoDB → UI updates state from the
response (optimistically for create, from-the-server for update/delete)
→ re-rendered list.

## Run it

You need **both** servers running at once, in two separate terminals:

```bash
# Terminal 1 — backend
cd ../task-manager-api
npm run dev

# Terminal 2 — this app
cd task-manager-ui
npm install
cp .env.example .env.local   # then edit VITE_API_BASE_URL if your backend
                               # isn't on the port it defaults to
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

**If requests fail or your browser console shows a CORS error:** confirm
the backend terminal is actually running and listening (a common mistake
per the practical's troubleshooting guide is debugging the frontend for
what's really just "the backend isn't started"). `task-manager-api`
already has `app.use(cors())` wired in, so a fresh CORS error usually
means you're pointed at the wrong port in `.env.local`.

## What it does

- **Create** — the form at the top POSTs a new task. The task appears in
  the list immediately (optimistic update, tagged "saving…"), then gets
  replaced with the real MongoDB document once the server responds — or
  removed with an error toast if the request fails.
- **Read** — the list is fetched from `GET /tasks` on mount and shows a
  spinner while loading, or an error box with a **Retry** button if the
  initial fetch fails.
- **Update** — click **Edit** on any task to change its title/description
  inline, or use the checkbox to toggle `completed` — both call
  `PUT /tasks/:id` and update local state from the response.
- **Delete** — click **Delete**, confirm in the dialog that appears, and
  the task is removed via `DELETE /tasks/:id`.
- **Toasts** — every create/update/delete shows a success or failure
  notification in the bottom-right corner.
- Refresh the browser at any point — since state is always derived from
  the backend (not hardcoded), your data persists.

## Project structure

```
src/
  api.js                    BASE_URL + getTasks/createTask/updateTask/deleteTask
  App.jsx                   owns tasks state, wires components to api.js
  context/ToastContext.jsx  toast notification provider + useToast hook
  components/
    TaskForm.jsx             create form
    TaskList.jsx / TaskItem.jsx   list + per-row view/edit/delete
    ConfirmDialog.jsx         delete confirmation modal
    Spinner.jsx / ErrorMessage.jsx   loading/error UI (same pattern as
                                     student-portfolio's Practical 3 work)
```

## Verified

- `npm run build` and `npx oxlint src` both pass cleanly (0 errors).
- This sandbox has no route to a live MongoDB, so full browser-driven
  end-to-end testing happened against the real backend on the developer's
  own machine (seeded data loads, create/edit/toggle/delete all
  confirmed working against `localhost:5050`).
- `api.js`'s exact request/response logic (URLs, methods, headers, error
  mapping on non-2xx responses) was additionally verified against a
  temporary stub server replicating `task-manager-api`'s `/tasks`
  contract — covering success paths, a 400 validation failure, a 404 on
  a missing id, and a double-delete.

## What's implemented (Practical 6 rubric)

- React correctly calls backend endpoints via a single `BASE_URL`
  constant in `api.js` — no hardcoded URLs scattered across files
- CORS configured on the Express side (`task-manager-api`'s `server.js`)
- Create: form submission persists to MongoDB and appears in the UI
  without a page refresh (optimistic + server-confirmed)
- Read: task list fetched from the backend on load, not hardcoded
- Update: inline edit and the completed-toggle both call the API and
  reflect the change in the UI
- Delete: removes the task via the API and updates the UI immediately
- Loading and error states handled for every operation, not just the
  initial fetch
- Supplementary: confirmation dialog before delete, toast notifications
  for every operation, optimistic UI update on create
