import { Link } from "react-router-dom";
import { projects } from "../app/data";
import { useAppContext } from "../app/context";

export function ProjectsPage() {
  const { tasks, showNotice } = useAppContext();

  return (
    <div className="page-content">
      <div className="welcome-row"><div><div className="eyebrow">PLAN TOGETHER</div><h1>Projects</h1><p className="muted">A clear view of what your team is building.</p></div><button className="primary-button" onClick={() => showNotice("Project creation will be added in a future version")}>＋ New project</button></div>
      <div className="project-card-grid">
        {projects.map((project) => {
          const related = tasks.filter((task) => task.project === project.name);
          const done = related.filter((task) => task.status === "Done").length;
          const percent = related.length ? Math.round(done / related.length * 100) : 0;
          return (
            <Link className="project-card" key={project.name} to={`/tasks?project=${encodeURIComponent(project.name)}`}>
              <div className="project-card-top"><span className={`project-square ${project.color}`}>{project.name.slice(0, 1)}</span><span className="more-button">•••</span></div>
              <h2>{project.name}</h2><p>{project.detail}</p>
              <div className="project-card-meta"><span>▤ {related.length} tasks</span><span>◷ Due {project.due}</span></div>
              <div className="project-card-bottom"><div className="avatar-stack"><span className="avatar avatar-violet">AM</span><span className="avatar avatar-blue">JK</span><span className="avatar avatar-orange">SL</span></div><span>{percent}% complete</span></div>
              <div className="progress-track"><div style={{ width: `${percent}%` }} /></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
