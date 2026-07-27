import React, { useState } from 'react';
import { Sparkles, MapPin, Search, Loader2, Navigation } from 'lucide-react';
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

export default function ElectricalElectronicsShops() {
  const [location, setLocation] = useState('');
  const [shops, setShops] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const findShops = async () => {
    if (!location.trim()) { setError('Please enter a location'); return; }
    setError(''); setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/ee-shops", { location });
      if (response.status === 200) {
        if (response.data.length === 0) setError('No shops found in this area.');
        else setShops(response.data);
      }
    } catch { setError('Could not connect to the server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Shop finder
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Electrical & Electronics Shops
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Find the right parts for your smart farming tools and equipment.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && findShops()}
                placeholder="Search Pune, Delhi, etc..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100" />
              <button onClick={findShops} disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all shadow-md disabled:opacity-60">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? 'Searching...' : 'Find Shops'}
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">{error}</div>
            )}

            {shops.length > 0 && !loading && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <MapPin size={20} className="text-green-600" /> {shops.length} Shops Found
                  </h3>
                  <div className="max-h-[450px] overflow-y-auto space-y-3 pr-2">
                    {shops.map((shop, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-green-200 hover:bg-green-50 transition-all group">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-green-700">{shop.name}</p>
                        <a href={shop.link} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold text-green-600 hover:text-green-700 mt-2 inline-flex items-center gap-1">
                          <Navigation size={12} /> View on Maps
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-200 h-[450px]">
                    {shops.length > 0 ? (
                      <MapContainer key={shops[0].latitude} center={[shops[0].latitude, shops[0].longitude]} zoom={12} className="h-full w-full" zoomControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ZoomControl position="bottomright" />
                        {shops.map((shop, i) => (
                          <Marker key={i} position={[shop.latitude, shop.longitude]}>
                            <Popup><b>{shop.name}</b><br/><a href={shop.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">View Map</a></Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    ) : (
                      <div className="bg-slate-100 h-full w-full flex items-center justify-center text-slate-400 italic">Map will activate after search</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!loading && shops.length === 0 && !error && (
              <div className="text-center py-16 text-slate-400">
                <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Enter a city to see nearby electrical shops.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
