import { fmtAgo, fmtNum, parseTs } from '../format.js';

export default function Stats({ clusters }) {
  const uniqueShips = new Set(clusters.flatMap((c) => c.mmsis)).size;
  const registros = clusters.reduce((s, c) => s + (c.n_registros ?? 0), 0);
  const latest = clusters.reduce((max, c) => {
    const t = parseTs(c.last_ts)?.getTime() ?? 0;
    return t > max ? t : max;
  }, 0);

  return (
    <div className="stats">
      <Stat label="Clusters" value={fmtNum(clusters.length)} />
      <Stat label="Navios únicos (MMSI)" value={fmtNum(uniqueShips)} />
      <Stat label="Registros AIS" value={fmtNum(registros)} />
      <Stat label="Último registro" value={latest ? fmtAgo(latest) : '—'} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
