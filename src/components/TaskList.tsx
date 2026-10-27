import { people, projects, TODAY } from "../app/data";
import type { Task, TaskStatus } from "../app/types";

type TaskListProps = {
  tasks: Task[];
  onStatus: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskList({ tasks, onStatus, onEdit, onDelete }: TaskListProps) {
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div className="task-row" key={task.id}>
          <button
            className={`task-check ${task.status === "Done" ? "checked" : ""}`}
            title="Mark complete"
            onClick={() => onStatus(task.id, task.status === "Done" ? "To do" : "Done")}
          >
            {task.status === "Done" ? "✓" : ""}
          </button>
          <div className="task-main">
            <button className={`task-title ${task.status === "Done" ? "completed-title" : ""}`} onClick={() => onEdit(task)}>
              {task.title}
            </button>
            <div className="task-meta">
              <span className={`project-dot ${projects.find((project) => project.name === task.project)?.color ?? "violet"}`} />
              {task.project}
              <span className="meta-separator">·</span>
              <span className={task.due && task.due < TODAY && task.status !== "Done" ? "overdue-date" : ""}>
                ◷ {task.due ? new Date(`${task.due}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No due date"}
              </span>
            </div>
          </div>
          <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
          <select
            className={`status-select status-${task.status.toLowerCase().replace(" ", "-")}`}
            aria-label={`Status for ${task.title}`}
            value={task.status}
            onChange={(event) => onStatus(task.id, event.target.value as TaskStatus)}
          >
            <option>To do</option>
            <option>In progress</option>
            <option>Done</option>
          </select>
          <div className={`avatar avatar-${people.find((person) => person.initials === task.assignee)?.color ?? "violet"} task-avatar`}>
            {task.assignee}
          </div>
          <div className="task-actions">
            <button title="Edit task" onClick={() => onEdit(task)}>✎</button>
            <button title="Delete task" onClick={() => { if (window.confirm("Delete this task?")) onDelete(task.id); }}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}
