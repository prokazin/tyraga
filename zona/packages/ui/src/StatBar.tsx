interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function StatBar({ label, value, max, color = "#c9a227" }: StatBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="stat">
      <div className="stat-head">
        <span>{label}</span>
        <span className="stat-value">
          {value} / {max}
        </span>
      </div>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}90, ${color})`
          }}
        />
        <div className="stat-ticks" />
      </div>
    </div>
  );
}
