import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { fmtNum, naviosColor, NAVIOS_FAIXAS } from '../format.js';

const US_CENTER = [39.5, -98.35];

function FlyToSelected({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.lat != null && selected?.lon != null) {
      map.flyTo([selected.lat, selected.lon], Math.max(map.getZoom(), 9), { duration: 0.8 });
    }
  }, [map, selected?.lat, selected?.lon]);
  return null;
}

const RADIUS = 8;

function Legend() {
  return (
    <div className="legend">
      <strong>Navios no cluster</strong>
      {NAVIOS_FAIXAS.map((f) => (
        <div key={f.label} className="legend-row">
          <span className="dot" style={{ background: f.cor }} />
          {f.label}
        </div>
      ))}
    </div>
  );
}

export default function ClusterMap({ clusters, selected, keyOf, onSelect }) {
  const selectedKey = selected ? keyOf(selected) : null;

  return (
    <>
      <MapContainer center={US_CENTER} zoom={4} className="map" worldCopyJump>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clusters
          .filter((c) => c.lat != null && c.lon != null)
          .map((c) => {
            const k = keyOf(c);
            const color = naviosColor(c.n_navios);
            const isSel = k === selectedKey;
            return (
              <CircleMarker
                key={k}
                center={[c.lat, c.lon]}
                radius={isSel ? RADIUS + 3 : RADIUS}
                pathOptions={{
                  color: isSel ? '#111827' : color,
                  weight: isSel ? 3 : 1.5,
                  fillColor: color,
                  fillOpacity: isSel ? 0.9 : 0.7,
                }}
                eventHandlers={{ click: () => onSelect(k) }}
              >
                <Tooltip direction="top" offset={[0, -4]}>
                  <strong>{c.cluster}</strong> · {c.region}
                  <br />
                  {fmtNum(c.n_navios)} navios · {fmtNum(c.n_registros)} registros
                </Tooltip>
              </CircleMarker>
            );
          })}
        <FlyToSelected selected={selected} />
      </MapContainer>
      <Legend />
    </>
  );
}
