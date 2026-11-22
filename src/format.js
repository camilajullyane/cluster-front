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

const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

// Centro (lon) de uma célula de geohash, ou null se o texto não for um geohash válido.
function geohashLon(hash) {
  let lonMin = -180, lonMax = 180, isLon = true;
  for (const ch of hash.toLowerCase()) {
    const v = GEOHASH_BASE32.indexOf(ch);
    if (v < 0) return null;
    for (let bit = 4; bit >= 0; bit--) {
      if (isLon) {
        const mid = (lonMin + lonMax) / 2;
        if ((v >> bit) & 1) lonMin = mid;
        else lonMax = mid;
      }
      isLon = !isLon;
    }
  }
  return (lonMin + lonMax) / 2;
}

// Faixa de longitude dos EUA usada no gradiente: Havaí (~-170) a Maine (~-65).
const LON_WEST = -170;
const LON_EAST = -65;

// A região é um geohash de 3 caracteres (~156 km). A cor segue a longitude do
// centro da célula: roxo/azul no oeste até laranja/vermelho no leste, então
// células vizinhas têm tons parecidos e a cor nunca muda entre atualizações.
// Textos que não são geohash (ex.: dados simulados) caem num hash na paleta.
export function regionColor(region) {
  const r = String(region ?? '');
  const lon = r ? geohashLon(r) : null;
  if (lon === null) {
    let h = 0;
    for (const ch of r) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }
  const t = Math.min(1, Math.max(0, (lon - LON_WEST) / (LON_EAST - LON_WEST)));
  return `hsl(${Math.round(270 - t * 270)}, 70%, 45%)`;
}
