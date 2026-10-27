# Frontend Task CRUD integration

This update is based on the uploaded `task-manager-frontend` project and preserves its existing Stride UI and Cognito sign-in screens.

## Required backend
Run the matching Task CRUD API backend at `http://localhost:4000`. Expected endpoints:
- `GET /api/v1/tasks` -> `{ data: { items: Task[], pagination?: ... } }`
- `POST /api/v1/tasks` -> `{ data: Task }`
- `PATCH /api/v1/tasks/:id` -> `{ data: Task }`
- `DELETE /api/v1/tasks/:id` -> HTTP `204`

Every request obtains the current Cognito **access token** from Amplify and sends `Authorization: Bearer <token>`.

## Frontend environment
Keep your real Cognito values in `.env`:
```dotenv
VITE_API_BASE_URL=http://localhost:4000
VITE_COGNITO_USER_POOL_ID=ap-south-1_REPLACE_ME
VITE_COGNITO_USER_POOL_CLIENT_ID=REPLACE_ME
```

## Current backend model mapping
Persisted fields are title, description, status (`todo`, `in_progress`, `done`), priority (`low`, `medium`, `high`), and dueDate. The UI maps status/priority values to title case.

Project and assignee are not currently part of the backend task schema, so the UI uses a placeholder project (`General`) and assignee (`ME`) for tasks returned by the API. Those fields are not persisted. Add them to the backend model and validation schemas before expecting them to persist.

## Run
```powershell
npm install
npm run build
npm run dev
```

Then sign in, create a task, reload the page, and verify the task persists. Test edit, status changes, and delete. This archive has not been built in an environment with installed dependencies.
