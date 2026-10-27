import { useState } from "react";
import type { FormEvent } from "react";
import { useAppContext } from "../app/context";
import type { Task } from "../app/types";

type TaskDialogProps = {
  task: Task | null;
  onClose: () => void;
};

export function TaskDialog({ task, onClose }: TaskDialogProps) {
  const { saveTask } = useAppContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    try {
      await saveTask({
        title: String(data.get("title") || "").trim(),
        description: String(data.get("description") || "").trim(),
        status: String(data.get("status") || "To do") as Task["status"],
        priority: String(data.get("priority") || "Medium") as Task["priority"],
        due: String(data.get("due") || ""),
      }, task?.id);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="task-modal panel" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title">
        <div className="panel-heading">
          <div><h2 id="task-dialog-title">{task ? "Edit task" : "Create a task"}</h2><p className="muted">Keep the next step clear and actionable.</p></div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>Task name<input name="title" defaultValue={task?.title} maxLength={200} required /></label>
          <label>Description<textarea name="description" defaultValue={task?.description} maxLength={5000} rows={4} /></label>
          <div className="form-row">
            <label>Status<select name="status" defaultValue={task?.status ?? "To do"}><option>To do</option><option>In progress</option><option>Done</option></select></label>
            <label>Priority<select name="priority" defaultValue={task?.priority ?? "Medium"}><option>Low</option><option>Medium</option><option>High</option></select></label>
          </div>
          <label>Due date<input type="date" name="due" defaultValue={task?.due} /></label>
          {error && <p className="auth-config-warning" role="alert">{error}</p>}
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={busy}>{busy ? "Saving…" : task ? "Save task" : "Create task"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
