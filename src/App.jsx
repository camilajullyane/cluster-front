import { useCallback, useEffect, useMemo, useState } from 'react';
import ClusterMap from './components/ClusterMap.jsx';
import ClusterList from './components/ClusterList.jsx';
import ClusterDetail from './components/ClusterDetail.jsx';
import Stats from './components/Stats.jsx';
import { parseTs } from './format.js';

const REFRESH_MS = 30_000;
// Vazio = mesma origem (/api atrás do proxy do nginx). Defina VITE_API_URL
// para chamar a Lambda direto (exige ALLOWED_ORIGIN configurado nela).
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const keyOf = (c) => `${c.region}#${c.cluster}`;

const SORTS = {
  n_navios: (a, b) => (b.n_navios ?? 0) - (a.n_navios ?? 0),
  n_registros: (a, b) => (b.n_registros ?? 0) - (a.n_registros ?? 0),
  last_ts: (a, b) => (parseTs(b.last_ts)?.getTime() ?? 0) - (parseTs(a.last_ts)?.getTime() ?? 0),
  cluster: (a, b) => a.cluster.localeCompare(b.cluster, undefined, { numeric: true }),
};

export default function App() {
  const [clusters, setClusters] = useState([]);
  const [meta, setMeta] = useState({ source: '', fetched_at: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [region, setRegion] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('n_navios');
  const [selectedKey, setSelectedKey] = useState(null);

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clusters${fresh ? '?fresh=1' : ''}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
      setClusters(body.items);
      setMeta({ source: body.source, fetched_at: body.fetched_at });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const regions = useMemo(() => [...new Set(clusters.map((c) => c.region))].sort(), [clusters]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clusters
      .filter((c) => !region || c.region === region)
      .filter((c) => !q || c.cluster.toLowerCase().includes(q) || c.mmsis.some((m) => m.includes(q)))
      .sort(SORTS[sort]);
  }, [clusters, region, query, sort]);

  const selected = useMemo(() => clusters.find((c) => keyOf(c) === selectedKey) ?? null, [clusters, selectedKey]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Clusters de Portos — EUA</h1>
          <span className="source">
            {meta.source === 'mock' ? 'dados simulados' : meta.source}
            {meta.fetched_at ? ` · atualizado ${new Date(meta.fetched_at).toLocaleTimeString('pt-BR')}` : ''}
          </span>
        </div>
        <div className="actions">
          <label className="toggle">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto (30s)
          </label>
          <button onClick={() => load(true)} disabled={loading}>
            {loading ? 'Carregando…' : 'Atualizar'}
          </button>
        </div>
      </header>

      {error && <div className="error">Erro ao consultar o DynamoDB: {error}</div>}

      <Stats clusters={filtered} />

      <main className="layout">
        <aside className="sidebar">
          <div className="filters">
            <input
              type="search"
              placeholder="Buscar cluster ou MMSI…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="row">
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Todas as regiões</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="n_navios">Mais navios</option>
                <option value="n_registros">Mais registros</option>
                <option value="last_ts">Mais recente</option>
                <option value="cluster">Nome</option>
              </select>
            </div>
          </div>
          <ClusterList
            clusters={filtered}
            selectedKey={selectedKey}
            keyOf={keyOf}
            onSelect={setSelectedKey}
          />
        </aside>

        <section className="map-wrap">
          <ClusterMap
            clusters={filtered}
            selected={selected}
            keyOf={keyOf}
            onSelect={setSelectedKey}
          />
          {selected && <ClusterDetail cluster={selected} onClose={() => setSelectedKey(null)} />}
        </section>
      </main>
    </div>
  );
}
