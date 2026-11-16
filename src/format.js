// last_ts pode vir como epoch em segundos, em milissegundos ou string ISO.
export function parseTs(ts) {
  if (ts === null || ts === undefined || ts === '') return null;
  const n = typeof ts === 'number' ? ts : /^\d+(\.\d+)?$/.test(String(ts)) ? Number(ts) : NaN;
  if (!Number.isNaN(n)) return new Date(n > 1e12 ? n : n * 1000);
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dtf = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
const nf = new Intl.NumberFormat('pt-BR');

export const fmtDate = (ts) => {
  const d = parseTs(ts);
  return d ? dtf.format(d) : '—';
};

export function fmtAgo(ts) {
  const d = parseTs(ts);
  if (!d) return '—';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `há ${s}s`;
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return `há ${Math.floor(s / 86400)} d`;
}

export const fmtNum = (n) => (n === null || n === undefined ? '—' : nf.format(n));
export const fmtCoord = (n) => (n === null || n === undefined ? '—' : n.toFixed(5));

const PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5'];
export function regionColor(region, regions) {
  const i = regions.indexOf(region);
  return PALETTE[(i < 0 ? 0 : i) % PALETTE.length];
}
