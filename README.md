# Task Manager frontend

React, TypeScript, Vite, and React Router frontend for the Task Manager API.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
# Set the Cognito User Pool values in .env.
npm run dev
```

Set `VITE_API_BASE_URL` to the API origin only (for example, `http://localhost:4000`); do not append `/api/v1`. Health checks use the root `/health/live` endpoint, while task requests add `/api/v1` themselves.

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/login` | Sign in | Public |
| `/signup` | Create an account | Public |
| `/forgot` | Request a password reset | Public |
| `/confirm` | Confirm a new account | Public |
| `/reset-password` | Complete a password reset | Public |
| `/dashboard` | Task overview | Signed in |
| `/tasks` | Task list and project filter | Signed in |
| `/projects` | Projects | Signed in |
| `/calendar` | Due-date calendar | Signed in |
| `/team` | Team | Signed in |
| `/settings` | Profile settings | Signed in |

Unknown routes redirect to the appropriate landing page. Routes are defined as a `createBrowserRouter` route-object array in `src/app/router.tsx`. When deploying browser-history routes to a static host, configure it to serve `index.html` for application paths (the supplied CloudFront distribution has SPA error responses configured).

## Frontend structure

- `src/app/router.tsx` declares public and protected routes.
- `src/app/providers.tsx` restores the Cognito session and owns shared API, task, and notice state.
- `src/app/WorkspaceLayout.tsx` provides the authenticated sidebar, header, and task dialog.
- `src/pages/` contains the auth, dashboard, task, project, calendar, team, and settings pages.
- `src/components/` contains shared task and dashboard UI.
- `src/features/tasks/task-api.ts` maps frontend task operations to the versioned API.

Project and assignee values are still presentation-only because they are not currently persisted by the backend task schema.
