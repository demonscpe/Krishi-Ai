import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BgImg from '../assets/106.jpg';

// Fix for missing marker icon in Leaflet
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
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setError('');
    setLabs([]); // Clear previous results
    setLoading(true);

    try {
      // NOTE: Render free tier services "spin down" after inactivity.
      // This request might take 30+ seconds to start if the server is cold.
      const response = await axios.post('https://agrotech-api.onrender.com/soil_labs', 
        { location: location },
        { timeout: 40000 } // Give it 40 seconds to wake up
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setError('No labs found in this area. Try a nearby city.');
        } else {
          setLabs(response.data);
        }
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      console.error("API Error:", err);
      if (err.code === 'ECONNABORTED') {
        setError('Server is taking too long to wake up. Please try again in a moment.');
      } else {
        setError('Failed to connect to the server. It might be offline.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 mt-10 font-['Poppins'] antialiased" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), url(${BgImg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="glassmorphic-container max-w-5xl w-full space-y-8 p-6 md:p-10 rounded-[2rem] shadow-2xl backdrop-blur-md bg-white/80 border border-white/20">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-[36px] leading-tight font-bold text-green-900">
            Soil Testing Centers Finder
          </h1>
          <p className="text-gray-600 font-medium italic">Find laboratories to analyze your soil health</p>
          <div className="h-1 w-20 bg-green-600 mx-auto rounded-full mt-2"></div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-0 max-w-lg mx-auto overflow-hidden rounded-2xl shadow-lg border border-green-100 bg-white">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && findSoilLabs()}
            placeholder="Enter city (e.g. Pune, Delhi)..."
            className="w-full px-6 py-4 bg-transparent text-gray-700 focus:outline-none text-lg"
          />
          <button
            onClick={findSoilLabs}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-green-700 text-white font-bold hover:bg-green-800 transition-colors disabled:opacity-70 flex items-center justify-center whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Wait 30s...
              </span>
            ) : (
              'Find Labs'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mx-auto max-w-md text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {labs.length > 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="lg:col-span-8">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[450px]">
                {/* Key prop ensures map re-renders when first lab changes */}
                <MapContainer 
                  key={labs[0].latitude}
                  center={[labs[0].latitude, labs[0].longitude]} 
                  zoom={11} 
                  className="h-full w-full"
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <ZoomControl position="bottomright" />
                  {labs.map((lab, index) => (
                    <Marker key={index} position={[lab.latitude, lab.longitude]}>
                      <Popup>
                        <div className="font-['Poppins']">
                          <h4 className="font-bold text-green-800 leading-tight">{lab.name}</h4>
                          <a href={lab.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs underline">Open Maps</a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
                <span className="bg-green-100 p-2 rounded-lg text-sm">📍</span> {labs.length} Labs Found
              </h3>
              <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3">
                {labs.map((lab, index) => (
                  <div key={index} className="bg-white/90 p-4 rounded-xl border border-white shadow-sm hover:shadow-md transition-all">
                    <p className="font-bold text-gray-800 text-sm">{lab.name}</p>
                    <a 
                      href={lab.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-green-700 tracking-widest uppercase mt-2 block"
                    >
                      View Location
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && labs.length === 0 && !error && (
          <div className="text-center py-10">
            <div className="text-4xl mb-2 opacity-50">🌾</div>
            <p className="text-gray-500 font-medium">Search for your city to see nearby testing centers.</p>
          </div>
        )}
      </div>
    </div>
  );
}