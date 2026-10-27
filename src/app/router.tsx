import { createBrowserRouter } from "react-router-dom";
import { WorkspaceLayout } from "./WorkspaceLayout";
import { AuthRoute, ProtectedRoute, RootRedirect } from "./route-guards";
import { AuthPage } from "../pages/AuthPage";
import { CalendarPage } from "../pages/CalendarPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TasksPage } from "../pages/TasksPage";
import { TeamPage } from "../pages/TeamPage";

export const router = createBrowserRouter([
  {
    element: <AuthRoute />,
    children: [
      { path: "/login", element: <AuthPage /> },
      { path: "/signup", element: <AuthPage /> },
      { path: "/forgot", element: <AuthPage /> },
      { path: "/confirm", element: <AuthPage /> },
      { path: "/reset-password", element: <AuthPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <WorkspaceLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/tasks", element: <TasksPage /> },
          { path: "/projects", element: <ProjectsPage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/team", element: <TeamPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "/", element: <RootRedirect /> },
  { path: "*", element: <RootRedirect /> },
]);