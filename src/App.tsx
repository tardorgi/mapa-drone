import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import { useState } from 'react';

function ClickHandler({ onClick }: any) {
  useMapEvents({
    //click(e) {
    //  onClick(e.latlng);
    //}
  });
  return null;
}

export default function App() {
  const [points, setPoints] = useState<any[]>([]);

  return (
    <MapContainer >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler
        onClick={(latlng: any) => {
          setPoints([...points, latlng]);
        }}
      />

      {points.map((p, i) => (
        <Marker key={i} position={p} />
      ))}
    </MapContainer>
  );
}