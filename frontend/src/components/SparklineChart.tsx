interface DataPoint {
  x: string; // ISO timestamp, used as the point label
  y: number;
}

interface SparklineChartProps {
  title: string;
  data: DataPoint[];
  color: string;
  unit?: string;
  height?: number;
}

/**
 * Minimal single-series line chart (no charting library installed).
 * One sequential hue per the dataviz palette; each point carries a native
 * tooltip via <title>, and a compact table underneath gives a non-visual
 * fallback for the same data.
 */
export function SparklineChart({ title, data, color, unit = '', height = 120 }: SparklineChartProps) {
  if (data.length === 0) {
    return (
      <div className="sparkline">
        <div className="sparkline-title">{title}</div>
        <p className="hint">Not enough data yet.</p>
      </div>
    );
  }

  const width = 480;
  const padding = 24;
  const values = data.map((d) => d.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const yRange = maxY - minY || 1;

  const points = data.map((d, i) => {
    const px = data.length === 1 ? width / 2 : padding + (i / (data.length - 1)) * (width - padding * 2);
    const py = height - padding - ((d.y - minY) / yRange) * (height - padding * 2);
    return { px, py, timestamp: d.x, value: d.y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ');
  const latest = data[data.length - 1];

  return (
    <div className="sparkline">
      <div className="sparkline-title">
        {title} <span className="sparkline-latest" style={{ color }}>{latest.y}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={title}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2c2c2a" strokeWidth={1} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.timestamp} cx={p.px} cy={p.py} r={3.5} fill={color}>
            <title>{new Date(p.timestamp).toLocaleString()}: {p.value}{unit}</title>
          </circle>
        ))}
      </svg>
      <details className="sparkline-table">
        <summary>Show data table</summary>
        <table>
          <thead><tr><th>Time</th><th>Value{unit}</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.x}><td>{new Date(d.x).toLocaleString()}</td><td>{d.y}{unit}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
