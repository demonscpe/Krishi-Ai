import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BgImg from '../assets/crop_monitor.jpg';

// Leaflet Icon Fix
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
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/find_ee_shops", { location });
      if (response.status === 200) {
        setShops(response.data); 
        if(response.data.length === 0) setError('No shops found in this area.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Increased mt-24 to prevent Navbar overlap seen in your screenshot */
    <div 
      className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 mt-24 font-['Poppins'] antialiased"
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), url(${BgImg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="glassmorphic-container max-w-6xl w-full space-y-8 p-6 md:p-10 rounded-[2rem] shadow-2xl backdrop-blur-md bg-white/90 border border-white/40">
        
        {/* Header Section - matching 38px exactly */}
        <div className="text-center space-y-2">
          <h1 className="text-[36px] leading-tight font-bold text-blue-900">
            Electrical and Electronics Shop Finder
          </h1>
          <p className="text-gray-600 font-medium italic">Find the right parts for your smart farming tools</p>
          <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full mt-2"></div>
        </div>

        {/* Unified Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center max-w-lg mx-auto overflow-hidden rounded-2xl shadow-lg border border-blue-100 bg-white">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && findShops()}
            placeholder="Search Pune, Delhi, etc..."
            className="w-full px-6 py-4 bg-transparent text-gray-700 focus:outline-none text-lg"
          />
          <button
            onClick={findShops} 
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mx-auto"></div> : 'Find Shops'}
          </button>
        </div>

        {error && <p className="text-red-500 text-center font-medium">{error}</p>}

        {/* Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-blue-900">Results</h3>
            <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3">
              {shops.length > 0 ? (
                shops.map((shop, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-blue-50 hover:border-blue-300 shadow-sm transition-all hover:translate-x-1 group">
                    <p className="font-bold text-gray-800 group-hover:text-blue-600">{shop.name}</p>
                    <a href={shop.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-400 tracking-tighter uppercase mt-2 block">
                      Google Maps Link →
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl opacity-40">
                   <p>Enter a city to see shops</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white h-[450px]">
              {shops.length > 0 ? (
                <MapContainer 
                  key={shops[0].latitude}
                  center={[shops[0].latitude, shops[0].longitude]} 
                  zoom={12} 
                  className="h-full w-full"
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <ZoomControl position="bottomright" />
                  {shops.map((shop, i) => (
                    <Marker key={i} position={[shop.latitude, shop.longitude]}>
                      <Popup>
                        <div className="font-['Poppins']">
                           <b>{shop.name}</b><br/>
                           <a href={shop.link} target="_blank" rel="noopener noreferrer">View Map</a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="bg-gray-100 h-full w-full flex items-center justify-center text-gray-400 italic">
                  Map will activate after search
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}