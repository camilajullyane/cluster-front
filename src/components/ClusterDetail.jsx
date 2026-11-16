import { useState } from 'react';
import { fmtAgo, fmtCoord, fmtDate, fmtNum } from '../format.js';

export default function ClusterDetail({ cluster: c, onClose }) {
  const [filter, setFilter] = useState('');

  // Centroide derivado dos acumuladores, para comparar com lat/lon gravados.
  const centroidLat = c.n_registros ? c.soma_lat / c.n_registros : null;
  const centroidLon = c.n_registros ? c.soma_lon / c.n_registros : null;
  const mmsis = filter ? c.mmsis.filter((m) => m.includes(filter.trim())) : c.mmsis;

  return (
    <div className="detail">
      <div className="detail-head">
        <div>
          <h2>{c.cluster}</h2>
          <span className="badge">{c.region}</span>
        </div>
        <button className="close" onClick={onClose} aria-label="Fechar">×</button>
      </div>

      <dl className="fields">
        <dt>Navios</dt><dd>{fmtNum(c.n_navios)}</dd>
        <dt>Registros</dt><dd>{fmtNum(c.n_registros)}</dd>
        <dt>Último registro</dt><dd>{fmtDate(c.last_ts)} <small>({fmtAgo(c.last_ts)})</small></dd>
        <dt>Lat / Lon</dt><dd>{fmtCoord(c.lat)}, {fmtCoord(c.lon)}</dd>
        <dt>Centroide (soma / n)</dt><dd>{fmtCoord(centroidLat)}, {fmtCoord(centroidLon)}</dd>
        <dt>soma_lat</dt><dd>{c.soma_lat ?? '—'}</dd>
        <dt>soma_lon</dt><dd>{c.soma_lon ?? '—'}</dd>
      </dl>

      <div className="mmsi-head">
        <h3>MMSIs ({fmtNum(c.mmsis.length)})</h3>
        <input type="search" placeholder="Filtrar…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      <ul className="mmsi-list">
        {mmsis.map((m) => (
          <li key={m}>
            <a href={`https://www.marinetraffic.com/en/ais/details/ships/mmsi:${m}`} target="_blank" rel="noreferrer">
              {m}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
