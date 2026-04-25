
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Ícone customizado com número
const createCustomIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="display: flex; align-items: center;">
      <img src="/pin_icon.png" style="width: 30px; height: 30px;" />
      <span style="background: red; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-left: -10px;">${number}</span>
    </div>`,
    iconSize: [50, 50],
    iconAnchor: [15, 26.2],
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

function MapCenterUpdater({ center }: { center: L.LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 18, { duration: 1.2 });
  }, [center, map]);

  return null;
}

export default function App() {
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [showCoords, setShowCoords] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([-22.69923273409645, -47.65179876099056]);
  const [searchResult, setSearchResult] = useState<L.LatLng | null>(null);

  const removeLeafletPanes = () => {
    document.querySelector('.leaflet-marker-pane')?.remove();
    document.querySelector('.leaflet-shadow-pane')?.remove();
  };

  useEffect(() => {
    if (!searchResult) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      removeLeafletPanes();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [searchResult]);

  const handleRemoveLast = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };
  const handleSearch = async () => {
    const trimmedAddress = searchAddress.trim();

    if (!trimmedAddress) {
      window.location.reload();
      return;
    }

    try {
      const response = await fetch(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&maxLocations=1&outFields=Match_addr&singleLine=${encodeURIComponent(trimmedAddress)}`
      );

      if (!response.ok) {
        throw new Error('Falha ao buscar o endereco.');
      }

      const data: {
        candidates?: Array<{
          location: {
            x: number;
            y: number;
          };
        }>;
      } = await response.json();

      const firstCandidate = data.candidates?.[0];

      if (!firstCandidate) {
        alert('Endereco nao encontrado.');
        return;
      }

      const foundPoint = L.latLng(firstCandidate.location.y, firstCandidate.location.x);
      setMapCenter(foundPoint);
      setSearchResult(foundPoint);
    } catch (error) {
      console.error('Erro ao pesquisar endereco:', error);
      alert('Nao foi possivel pesquisar esse endereco agora.');
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
    alert("Json Pronto para download! clique em OK e escolha o local a ser baixado");
    console.log('JSON exportado:', json);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waypoints.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <MapContainer
        center={mapCenter}
        zoom={18}
        style={{ height: "100vh", width: "100vw" }}
      >
        <MapCenterUpdater center={mapCenter} />
        <TileLayer
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"        />

        <ClickHandler
          onClick={(latlng: L.LatLng) => {
            setPoints([...points, latlng]);
            setShowCoords(true);}}
        />

        {points.map((p, i) => (
          <Marker key={i} position={p} icon={createCustomIcon(i + 1)}>
            <Popup>Marcador {i + 1}</Popup>
          </Marker>
        ))}

        {searchResult && (
          <Marker position={searchResult}>
            <Popup>Endereco encontrado</Popup>
          </Marker>
        )}
      </MapContainer>
      <div style={{ position: "absolute", top: 10, left: 100, zIndex: 1000, background: "rgba(255,255,255,0.9)", padding: 10, borderRadius: 8 }}>
        <button onClick={handleRemoveLast} style={{ marginRight: 8 }}>Remover última</button>
        <button onClick={handleRemoveAll} style={{ marginRight: 8 }}>Remover todas</button>
        <button onClick={handleExportJSON}>Exportar JSON</button>
        <input
          type="text"
          name="Search Location"
          id="Search"
          placeholder='Pesquisar Local'
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button onClick={handleSearch}>🔍</button>
      </div>
    </div>
  );
}
