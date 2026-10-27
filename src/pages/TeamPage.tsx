import { people } from "../app/data";
import { useAppContext } from "../app/context";

export function TeamPage() {
  const { tasks, showNotice } = useAppContext();

  return (
    <div className="page-content">
      <div className="welcome-row"><div><div className="eyebrow">BETTER TOGETHER</div><h1>Your team</h1><p className="muted">Meet the people making progress happen.</p></div><button className="primary-button" onClick={() => showNotice("Invitations will be connected when the backend is ready")}>＋ Invite member</button></div>
      <div className="team-card-grid">
        {people.map((person) => (
          <section className="panel team-card" key={person.initials}>
            <div className={`avatar avatar-${person.color} large-avatar`}>{person.initials}</div>
            <h2>{person.name}</h2><p>{person.role}</p><span className="member-status"><i /> Active this week</span>
            <div className="team-card-footer"><span>Assigned tasks</span><b>{tasks.filter((task) => task.assignee === person.initials).length}</b></div>
            <button className="secondary-button full-button" onClick={() => showNotice("Team profiles are demo-only")}>View profile</button>
          </section>
        ))}
      </div>
    </div>
  );
}
