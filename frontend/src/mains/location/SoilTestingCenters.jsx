import React, { useState } from 'react';
import { Sparkles, MapPin, Search, Loader2, ArrowLeft, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import bgHero from "../assets/bgHero.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SoilTestingCenters() {
  const [location, setLocation] = useState('');
  const [labs, setLabs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const findSoilLabs = async () => {
    if (!location.trim()) { setError('Please enter a location'); return; }
    setError(''); setLabs([]); setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/soil-labs', { location }, { timeout: 40000 });
      if (response.status === 200 && Array.isArray(response.data)) {
        if (response.data.length === 0) setError('No labs found in this area. Try a nearby city.');
        else setLabs(response.data);
      }
    } catch {
      setError('Server is loading. Please try again in a moment.');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Laboratory locator
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Soil Testing Centers
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Find laboratories to analyze your soil health and get accurate nutrient reports.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && findSoilLabs()}
                placeholder="Enter city (e.g. Pune, Delhi)..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100" />
              <button onClick={findSoilLabs} disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all shadow-md disabled:opacity-60">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? 'Searching...' : 'Find Labs'}
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">{error}</div>
            )}

            {labs.length > 0 && !loading && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-200 h-[450px]">
                    <MapContainer key={labs[0].latitude} center={[labs[0].latitude, labs[0].longitude]} zoom={11} className="h-full w-full" zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <ZoomControl position="bottomright" />
                      {labs.map((lab, i) => (
                        <Marker key={i} position={[lab.latitude, lab.longitude]}>
                          <Popup><b className="text-green-800">{lab.name}</b><br/><a href={lab.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Open Maps</a></Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <MapPin size={20} className="text-green-600" /> {labs.length} Labs Found
                  </h3>
                  <div className="max-h-[380px] overflow-y-auto space-y-3 pr-2">
                    {labs.map((lab, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-green-200 hover:bg-green-50 transition-all">
                        <p className="font-bold text-slate-800 text-sm">{lab.name}</p>
                        <a href={lab.link} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold text-green-600 hover:text-green-700 mt-2 inline-flex items-center gap-1">
                          <Navigation size={12} /> View Location
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && labs.length === 0 && !error && (
              <div className="text-center py-16 text-slate-400">
                <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Search for your city to see nearby testing centers.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
