import { useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { projects } from "../app/data";
import { useAppContext } from "../app/context";
import type { TaskStatus } from "../app/types";
import type { WorkspaceOutletContext } from "../app/WorkspaceLayout";
import { TaskList } from "../components/TaskList";

export function TasksPage() {
  const { tasks, search } = useAppContext();
  const { openTask, onStatus, onDelete } = useOutletContext<WorkspaceOutletContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectFilter = searchParams.get("project") ?? "All projects";
  const [filter, setFilter] = useState<"All" | TaskStatus>("All");
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesStatus = filter === "All" || task.status === filter;
    const matchesProject = projectFilter === "All projects" || task.project === projectFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${task.title} ${task.project} ${task.assignee}`.toLowerCase().includes(query);
    return matchesStatus && matchesProject && matchesSearch;
  }), [tasks, filter, projectFilter, search]);

  return (
    <div className="page-content">
      <div className="welcome-row"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>My tasks</h1><p className="muted">Manage your priorities and keep things moving.</p></div><button className="primary-button" onClick={() => openTask()}>＋ New task</button></div>
      <div className="task-toolbar">
        <select aria-label="Filter by project" value={projectFilter} onChange={(event) => setSearchParams(event.target.value === "All projects" ? {} : { project: event.target.value })}>
          <option>All projects</option>{projects.map((project) => <option key={project.name}>{project.name}</option>)}
        </select>
        <div className="filter-tabs">{(["All", "To do", "In progress", "Done"] as const).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
      </div>
      <section className="panel full-task-panel">
        <TaskList tasks={filteredTasks} onStatus={onStatus} onEdit={openTask} onDelete={onDelete} />
        {filteredTasks.length === 0 && <div className="empty-state"><span>☷</span><b>No tasks found</b><p>Try another filter or add a task.</p></div>}
      </section>
    </div>
  );
}
