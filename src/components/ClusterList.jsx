import { fmtAgo, fmtNum, regionColor } from '../format.js';

export default function ClusterList({ clusters, regions, selectedKey, keyOf, onSelect }) {
  if (!clusters.length) return <p className="empty">Nenhum cluster encontrado.</p>;

  return (
    <ul className="cluster-list">
      {clusters.map((c) => {
        const k = keyOf(c);
        return (
          <li key={k}>
            <button className={k === selectedKey ? 'item active' : 'item'} onClick={() => onSelect(k)}>
              <span className="dot" style={{ background: regionColor(c.region, regions) }} />
              <span className="item-main">
                <strong>{c.cluster}</strong>
                <small>{c.region} · {fmtAgo(c.last_ts)}</small>
              </span>
              <span className="item-nums">
                <strong>{fmtNum(c.n_navios)}</strong>
                <small>navios</small>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
