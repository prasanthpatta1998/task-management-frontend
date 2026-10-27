import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { projects } from "./data";
import { useAppContext } from "./context";
import type { Task } from "./types";
import { TaskDialog } from "../components/TaskDialog";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: "◫" },
  { label: "My tasks", path: "/tasks", icon: "☷" },
  { label: "Projects", path: "/projects", icon: "▦" },
  { label: "Calendar", path: "/calendar", icon: "▦" },
  { label: "Team", path: "/team", icon: "♧" },
];

export function WorkspaceLayout() {
  const { user, tasks, apiStatus, search, setSearch, showNotice, signOut, setTaskStatus, deleteTask } = useAppContext();
  const [taskDialog, setTaskDialog] = useState<Task | null | undefined>(undefined);
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not sign out cleanly.");
    }
  }

  async function handleStatus(taskId: string, status: Task["status"]) {
    try {
      await setTaskStatus(taskId, status);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not update task status.");
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await deleteTask(taskId);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not delete task.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand sidebar-brand" to="/dashboard"><span className="brand-mark">s</span> stride</NavLink>
        <div className="workspace-switch"><div className="workspace-icon">W</div><div><b>Workspace</b><small>Personal workspace</small></div><span className="chevron">⌄</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav">
          {navigation.map(({ label, path, icon }) => (
            <NavLink key={path} to={path} end={path === "/dashboard"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span className="nav-icon">{icon}</span>{label}
              {label === "My tasks" && <span className="nav-count">{tasks.filter((task) => task.status !== "Done").length}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-project-heading"><span className="nav-label">YOUR PROJECTS</span><button aria-label="View projects" onClick={() => navigate("/projects")}>+</button></div>
        <div className="project-nav">
          {projects.map((project) => (
            <button key={project.name} onClick={() => navigate(`/tasks?project=${encodeURIComponent(project.name)}`)}>
              <i className={`project-dot ${project.color}`} />{project.name}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}><span className="nav-icon">⚙</span>Settings</NavLink>
          <div className="sidebar-profile">
            <div className="avatar avatar-violet">{user?.name.slice(0, 2).toUpperCase() || "ME"}</div>
            <div className="profile-text"><b>{user?.name || "My workspace"}</b><small>{user?.email}</small></div>
            <button title="Sign out" onClick={() => void handleSignOut()}>↗</button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><b><OutletTitle /></b></div>
          <div className="topbar-actions">
            <span className={`api-status api-status-${apiStatus}`} title={apiStatus === "connected" ? "Express API is reachable" : apiStatus === "offline" ? "Express API is unreachable" : "Checking Express API"}>
              <i />{apiStatus === "connected" ? "API connected" : apiStatus === "offline" ? "API offline" : "Checking API"}
            </span>
            <div className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></div>
            <button className="icon-button" title="Notifications" onClick={() => showNotice("You're all caught up!")}>♧<i className="notification-dot" /></button>
            <div className="avatar avatar-violet small-avatar">{user?.name.slice(0, 2).toUpperCase() || "ME"}</div>
          </div>
        </header>

        <Outlet context={{ openTask: (task?: Task) => setTaskDialog(task ?? null), onStatus: handleStatus, onDelete: handleDelete }} />
        <footer className="app-footer"><span>Stride Workspace</span><span>Made for meaningful work <b>✦</b></span><span>Tasks are synced with your API; project and assignee fields are demo-only</span></footer>
      </main>

      {taskDialog !== undefined && <TaskDialog task={taskDialog} onClose={() => setTaskDialog(undefined)} />}
    </div>
  );
}

function OutletTitle() {
  const { pathname } = useLocation();
  const title = navigation.find((item) => item.path === pathname)?.label
    ?? (pathname.startsWith("/tasks/") ? "Task details" : pathname.slice(1).replace(/^./, (first) => first.toUpperCase()));
  return title || "Dashboard";
}

export type WorkspaceOutletContext = {
  openTask: (task?: Task) => void;
  onStatus: (taskId: string, status: Task["status"]) => void;
  onDelete: (taskId: string) => void;
};
