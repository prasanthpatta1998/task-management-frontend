import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { people, projects, TODAY } from "../app/data";
import { useAppContext } from "../app/context";
import type { TaskStatus } from "../app/types";
import type { WorkspaceOutletContext } from "../app/WorkspaceLayout";
import { StatCard } from "../components/StatCard";
import { TaskList } from "../components/TaskList";

export function DashboardPage() {
  const { tasks, user, search } = useAppContext();
  const { openTask, onStatus, onDelete } = useOutletContext<WorkspaceOutletContext>();
  const [filter, setFilter] = useState<"All" | TaskStatus>("All");
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesStatus = filter === "All" || task.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${task.title} ${task.project} ${task.assignee}`.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }), [tasks, filter, search]);
  const counts = {
    total: tasks.length,
    progress: tasks.filter((task) => task.status === "In progress").length,
    done: tasks.filter((task) => task.status === "Done").length,
    overdue: tasks.filter((task) => task.status !== "Done" && task.due && task.due < TODAY).length,
  };

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div><div className="eyebrow">MONDAY, OCTOBER 19, 2026</div><h1>Good morning, {user?.name.split(" ")[0]} <span className="wave">✦</span></h1><p className="muted">Here's what's happening with your projects today.</p></div>
        <button className="primary-button" onClick={() => openTask()}>＋ New task</button>
      </div>
      <div className="stat-grid">
        <StatCard label="Total tasks" value={String(counts.total)} delta="" detail="Your tasks" icon="☷" tint="purple" />
        <StatCard label="In progress" value={String(counts.progress)} delta="" detail="Keep the momentum" icon="◷" tint="blue" />
        <StatCard label="Completed" value={String(counts.done)} delta="" detail="Tasks completed" icon="✓" tint="green" />
        <StatCard label="Overdue" value={String(counts.overdue)} delta={counts.overdue ? "Needs attention" : "All on track"} detail="Open tasks past due" icon="↗" tint="orange" />
      </div>
      <div className="dashboard-grid">
        <section className="panel task-panel">
          <div className="panel-heading"><div><h2>My tasks</h2><p className="muted">A little progress adds up.</p></div><Link className="subtle-button" to="/tasks">View all <span>→</span></Link></div>
          <div className="filter-tabs">{(["All", "To do", "In progress", "Done"] as const).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}{item === "All" && <span className="tab-count">{tasks.length}</span>}</button>)}</div>
          <TaskList tasks={filteredTasks.slice(0, 5)} onStatus={onStatus} onEdit={openTask} onDelete={onDelete} />
          {filteredTasks.length === 0 && <div className="empty-state"><span>☷</span><b>No tasks found</b><p>Try a different search or create a task.</p></div>}
        </section>
        <div className="right-column">
          <section className="panel focus-panel">
            <div className="panel-heading"><div><h2>Weekly focus</h2><p className="muted">Your workspace momentum</p></div><span className="round-icon">↗</span></div>
            <div className="focus-number"><strong>{counts.done}</strong><span>of {Math.max(counts.total, 1)} tasks completed</span></div>
            <div className="progress-track"><div style={{ width: `${counts.total ? (counts.done / counts.total) * 100 : 0}%` }} /></div>
            <div className="progress-caption"><span>This week</span><b>{Math.round(counts.total ? (counts.done / counts.total) * 100 : 0)}%</b></div>
            <div className="focus-note"><span>✦</span><p><b>You're building momentum.</b><br />Keep your focus on the next small step.</p></div>
          </section>
          <section className="panel projects-panel">
            <div className="panel-heading"><div><h2>Active projects</h2><p className="muted">What's moving forward</p></div><Link className="more-button" to="/projects">•••</Link></div>
            {projects.slice(0, 3).map((project) => {
              const related = tasks.filter((task) => task.project === project.name);
              const done = related.filter((task) => task.status === "Done").length;
              return <Link className="project-progress-row" key={project.name} to={`/tasks?project=${encodeURIComponent(project.name)}`}><span className={`project-square ${project.color}`}>{project.name.slice(0, 1)}</span><span className="project-progress-info"><b>{project.name}</b><small>{done} of {related.length} tasks</small><span className="mini-track"><i style={{ width: `${related.length ? done / related.length * 100 : 0}%` }} /></span></span><span className="project-percent">{related.length ? Math.round(done / related.length * 100) : 0}%</span></Link>;
            })}
          </section>
        </div>
      </div>
      <section className="panel team-panel">
        <div className="panel-heading"><div><h2>Your team</h2><p className="muted">Good work happens together.</p></div><Link className="subtle-button" to="/team">Meet the team <span>→</span></Link></div>
        <div className="team-row">{people.map((person) => <div className="team-person" key={person.initials}><div className={`avatar avatar-${person.color}`}>{person.initials}</div><div><b>{person.name}</b><small>{person.role}</small></div><span className="online-dot" /></div>)}</div>
      </section>
    </div>
  );
}
