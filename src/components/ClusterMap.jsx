import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { fmtNum, regionColor } from '../format.js';

const US_CENTER = [39.5, -98.35];
// Limite de navegação: cobre EUA continental, Alasca, Havaí e Porto Rico.
const US_BOUNDS = [
  [15, -180], // sudoeste (abaixo do Havaí, antimeridiano)
  [72, -60], // nordeste (norte do Alasca, leste do Maine/Porto Rico)
];

function FlyToSelected({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.lat != null && selected?.lon != null) {
      map.flyTo([selected.lat, selected.lon], Math.max(map.getZoom(), 9), { duration: 0.8 });
    }
  }, [map, selected?.lat, selected?.lon]);
  return null;
}

const radius = (n) => 6 + Math.sqrt(n ?? 0) * 2.5;

export default function ClusterMap({ clusters, selected, keyOf, onSelect }) {
  const selectedKey = selected ? keyOf(selected) : null;

  return (
    <MapContainer
      center={US_CENTER}
      zoom={4}
      minZoom={3}
      maxBounds={US_BOUNDS}
      maxBoundsViscosity={1}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clusters
        .filter((c) => c.lat != null && c.lon != null)
        .map((c) => {
          const k = keyOf(c);
          const color = regionColor(c.region);
          const isSel = k === selectedKey;
          return (
            <CircleMarker
              key={k}
              center={[c.lat, c.lon]}
              radius={radius(c.n_navios)}
              pathOptions={{
                color: isSel ? '#111827' : color,
                weight: isSel ? 3 : 1.5,
                fillColor: color,
                fillOpacity: isSel ? 0.75 : 0.45,
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
  );
}
