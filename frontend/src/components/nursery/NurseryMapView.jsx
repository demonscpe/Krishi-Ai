import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNursery } from '../../context/NurseryContext';

const userIcon = new L.DivIcon({
  className: '',
  html: '<div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>',
  iconSize: [20, 20],
});

const nurseryIcon = new L.DivIcon({
  className: '',
  html: '<div class="w-8 h-8 rounded-full bg-green-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">🌱</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const NurseryMapView = () => {
  const navigate = useNavigate();
  const { location, getMapData, mapData, darkMode, setDarkMode } = useNursery();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMapData();
  }, [location]);

  const center = [location?.lat || 12.8705, location?.lng || 78.5614];

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <header className="z-[1000] bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
        <h1 className="flex-1 font-bold">Map View</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white/10">{darkMode ? '🔆' : '🌙'}</button>
      </header>

      <div className="flex-1 relative">
        <MapContainer center={center} zoom={12} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {location?.lat && <Circle center={[location.lat, location.lng]} radius={500} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} />}
          {location?.lat && <Marker position={[location.lat, location.lng]} icon={userIcon}><Popup>You are here</Popup></Marker>}

          {(mapData?.nurseries || []).map((n) => (
            <Marker key={n.id} position={[n.latitude, n.longitude]} icon={nurseryIcon}
              eventHandlers={{ click: () => setSelected(n) }}>
              <Popup className="rounded-xl">
                <div className="w-56">
                  <h3 className="font-bold text-slate-800">{n.nurseryName}</h3>
                  <p className="text-xs text-slate-500">{n.distance_km ? `${n.distance_km.toFixed(1)} km` : ''}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => navigate(`/nursery/profile/${n.id}`)} className="flex-1 bg-green-600 text-white text-xs font-semibold rounded-lg py-2">View</button>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${n.latitude},${n.longitude}`} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-1 flex-1 bg-blue-600 text-white text-xs font-semibold rounded-lg py-2">
                      <Navigation size={12} /> Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Preview card */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-2xl bg-white shadow-xl p-4 flex items-center gap-3">
            <img src={selected.coverImage || selected.imageUrl || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200&q=80'} className="h-16 w-16 rounded-xl object-cover" alt="" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{selected.nurseryName}</h3>
              <p className="text-xs text-slate-500">{selected.distance_km ? `${selected.distance_km.toFixed(1)} km away` : ''} · {selected.open_now ? 'Open' : 'Closed'}</p>
            </div>
            <button onClick={() => navigate(`/nursery/profile/${selected.id}`)} className="bg-green-600 text-white text-sm font-semibold rounded-xl px-4 py-2">View</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseryMapView;
