type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  detail: string;
  icon: string;
  tint: string;
};

export function StatCard({ label, value, delta, detail, icon, tint }: StatCardProps) {
  return (
    <section className="panel stat-card">
      <div className={`stat-icon ${tint}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span className={tint === "orange" ? "delta-warn" : "delta-good"}>{delta}</span>
        <span>{detail}</span>
      </div>
    </section>
  );
}
