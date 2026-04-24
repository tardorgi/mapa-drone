
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';

// Ícone customizado com número
const createCustomIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="display: flex; align-items: center;">
      <img src="/pin_icon.png" style="width: 30px; height: 30px;" />
      <span style="background: red; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-left: -10px;">${number}</span>
    </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
};

function ClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e: { latlng: L.LatLng }) {
      onClick(e.latlng);
    }
  });
  return null;
}

export default function App() {
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [showCoords, setShowCoords] = useState(false);

  const handleRemoveLast = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleRemoveAll = () => {
    setPoints([]);
    setShowCoords(false);
  };

  const handleExportJSON = () => {
    const waypoints = points.map((p, i) => ({
      id: i + 1,
      latitude: p.lat,
      longitude: p.lng,
    }));
    const json = JSON.stringify(waypoints, null, 2);
    console.log('JSON exportado:', json);
    alert('JSON exportado no console!\n\n' + json);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <MapContainer
        center={[-22.69923273409645, -47.65179876099056]}
        zoom={28}
        style={{ height: "100vh", width: "100vw" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler
          onClick={(latlng: L.LatLng) => {
            setPoints([...points, latlng]);
          }}
        />

        {points.map((p, i) => (
          <Marker key={i} position={p} icon={createCustomIcon(i + 1)}>
            <Popup>Waypoint {i + 1}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, background: "rgba(255,255,255,0.9)", padding: 10, borderRadius: 8 }}>
        <button onClick={handleRemoveLast} style={{ marginRight: 8 }}>Remover última</button>
        <button onClick={handleRemoveAll} style={{ marginRight: 8 }}>Remover todas</button>
        <button onClick={handleExportJSON}>Exportar JSON</button>
      </div>
    </div>
  );
}