import { useOutletContext } from "react-router-dom";
import { useAppContext } from "../app/context";
import type { WorkspaceOutletContext } from "../app/WorkspaceLayout";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarPage() {
  const { tasks, showNotice } = useAppContext();
  const { openTask } = useOutletContext<WorkspaceOutletContext>();

  return (
    <div className="page-content">
      <div className="welcome-row"><div><div className="eyebrow">YOUR SCHEDULE</div><h1>Calendar</h1><p className="muted">A simple look at the work coming up.</p></div><button className="primary-button" onClick={() => openTask()}>＋ Add task</button></div>
      <section className="panel calendar-panel">
        <div className="calendar-title"><button className="icon-button" onClick={() => showNotice("Previous month is not available in this demo")}>←</button><h2>October 2026</h2><button className="icon-button" onClick={() => showNotice("Next month is not available in this demo")}>→</button><span className="today-tag">Today · Oct 19</span></div>
        <div className="calendar-grid">
          {weekdays.map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
          {Array.from({ length: 35 }, (_, index) => {
            const date = index - 2;
            const day = date < 1 ? 30 + date : date > 31 ? date - 31 : date;
            const inMonth = date >= 1 && date <= 31;
            const dateString = `2026-10-${String(day).padStart(2, "0")}`;
            const dayTasks = tasks.filter((task) => task.due === dateString);
            return (
              <div key={index} className={`calendar-day ${!inMonth ? "outside" : ""} ${inMonth && day === 19 ? "is-today" : ""}`}>
                <span>{day}</span>
                {dayTasks.slice(0, 2).map((task) => <button key={task.id} className={`calendar-task ${task.status === "Done" ? "calendar-done" : ""}`} title={task.title} onClick={() => openTask(task)}>{task.title}</button>)}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
