interface BarChartRow {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  title: string;
  rows: BarChartRow[];
  unit?: string;
}

/** Hand-rolled horizontal bar chart (no charting library installed). */
export function BarChart({ title, rows, unit = '' }: BarChartProps) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return (
      <div>
        <div className="sparkline-title">{title}</div>
        <p className="hint">No data yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sparkline-title">{title}</div>
      <div className="bar-chart">
        {rows.map((r) => (
          <div className="bar-row" key={r.label}>
            <span>{r.label}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(r.value / max) * 100}%`, background: r.color }} />
            </div>
            <span>{r.value}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
