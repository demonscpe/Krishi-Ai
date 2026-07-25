import React, { useEffect, useState } from 'react';
import { Search, Sparkles, MapPin, Droplets, Wind, Thermometer, Sunrise, Sunset, Gauge, AlertTriangle } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const API_KEY = 'af0348ed3ad216d028627277b50db13f';

const fetchData = async (URL) => {
  const response = await fetch(`${URL}&appid=${API_KEY}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const url = {
  currentWeather: (lat, lon) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`,
  airPollution: (lat, lon) => `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}`,
  forecast: (lat, lon) => `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`,
  geocoding: (query) => `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`,
};

const getDay = (dt) => new Date(dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const getTime = (ts) => new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WeatherDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
    <div className="p-2 rounded-lg bg-blue-50"><Icon size={20} className="text-blue-500" /></div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default function Climate() {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [currentWeather, setCurrentWeather] = useState([]);
  const [airQualityIndex, setAirQualityIndex] = useState(null);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchWeatherData = async (lat, lon) => {
    setLoading(true);
    setError(false);
    try {
      const current = await fetchData(url.currentWeather(lat, lon));
      const air = await fetchData(url.airPollution(lat, lon));
      const fc = await fetchData(url.forecast(lat, lon));
      setWeatherData(current);
      setAirQualityIndex(air.list[0].main.aqi);
      const now = Date.now();
      const cutoff = now + 24 * 60 * 60 * 1000;
      setCurrentWeather(fc.list.filter(entry => entry.dt * 1000 >= now && entry.dt * 1000 <= cutoff));
      setForecastData(fc.list.filter((_, i) => i % 8 === 0));
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) { setSuggestions([]); return; }
    try {
      const locations = await fetchData(url.geocoding(value));
      setSuggestions(locations);
    } catch {}
  };

  const handleSuggestionClick = (location) => {
    const { lat, lon, name, state, country } = location;
    setSelectedLocation(`${name}${state ? ', ' + state : ''}, ${country}`);
    setSearchTerm(`${name}${state ? ', ' + state : ''}, ${country}`);
    setSuggestions([]);
    fetchWeatherData(lat, lon);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported.'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => { setSelectedLocation('Your Current Location'); fetchWeatherData(position.coords.latitude, position.coords.longitude); },
      () => { setError(true); setLoading(false); }
    );
  };

  const aqiLabel = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Weather & climate intelligence
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Climate & Weather
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Real-time weather data, forecasts, and air quality information for your farming region.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            
            {/* Search */}
            <div className="relative mb-6">
              <div className="flex gap-0">
                <input type="text" value={searchTerm} onChange={handleSearchChange}
                  placeholder="Search for a location (City, State, Country)..."
                  className="flex-1 rounded-l-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100" />
                <button onClick={() => searchTerm && handleSearchChange({ target: { value: searchTerm } })}
                  className="px-6 bg-green-600 text-white rounded-r-2xl hover:bg-green-700 transition-all">
                  <Search size={20} />
                </button>
              </div>
              {suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  {suggestions.map((loc, i) => (
                    <button key={i} onClick={() => handleSuggestionClick(loc)}
                      className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition-all border-b border-slate-100 last:border-0">
                      <MapPin size={14} className="inline mr-2 text-slate-400" />{loc.name}{loc.state ? ', ' + loc.state : ''}, {loc.country}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={handleCurrentLocation}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 text-sm font-bold text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-md">
                <MapPin size={16} className="inline mr-2" /> Use Current Location
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">
                Error fetching data. Please try again.
              </div>
            )}

            {weatherData && (
              <div className="space-y-8">
                {/* Current Weather */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white">
                    <h2 className="text-lg font-bold mb-1">{selectedLocation || weatherData.name}</h2>
                    <div className="flex items-center gap-4 mt-4">
                      <img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt="" className="w-24 h-24 -ml-2" />
                      <div>
                        <p className="text-5xl font-extrabold">{Math.round(weatherData.main.temp)}°C</p>
                        <p className="text-sm text-green-100 capitalize mt-1">{weatherData.weather[0].description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <WeatherDetail icon={Droplets} label="Humidity" value={`${weatherData.main.humidity}%`} />
                    <WeatherDetail icon={Thermometer} label="Feels Like" value={`${Math.round(weatherData.main.feels_like)}°C`} />
                    <WeatherDetail icon={Wind} label="Wind Speed" value={`${Math.round(weatherData.wind.speed * 3.6)} km/h`} />
                    <WeatherDetail icon={Gauge} label="Pressure" value={`${weatherData.main.pressure} hPa`} />
                    <WeatherDetail icon={Sunrise} label="Sunrise" value={getTime(weatherData.sys.sunrise)} />
                    <WeatherDetail icon={Sunset} label="Sunset" value={getTime(weatherData.sys.sunset)} />
                  </div>
                </div>

                {/* Air Quality */}
                {airQualityIndex && (
                  <div className={`rounded-2xl p-5 border ${airQualityIndex <= 2 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${airQualityIndex <= 2 ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <AlertTriangle size={22} className={airQualityIndex <= 2 ? 'text-green-600' : 'text-amber-600'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Air Quality: {aqiLabel[airQualityIndex] || 'N/A'}</p>
                        <p className="text-xs text-slate-500">Index: {airQualityIndex}/5</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5-Day Forecast */}
                {forecastData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">5-Day Forecast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {forecastData.map((fc, i) => (
                        <div key={i} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                          <p className="text-xs font-bold text-slate-500 mb-2">{getDay(fc.dt)}</p>
                          <img src={`https://openweathermap.org/img/wn/${fc.weather[0].icon}@2x.png`} alt="" className="w-12 h-12 mx-auto" />
                          <p className="text-lg font-extrabold text-slate-800">{Math.round(fc.main.temp)}°C</p>
                          <p className="text-xs text-slate-400 capitalize">{fc.weather[0].description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hourly Forecast */}
                {currentWeather.length > 0 && (
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">Hourly Forecast (Next 24h)</h3>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-3 min-w-max">
                        {currentWeather.map((entry, i) => (
                          <div key={i} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center w-[110px]">
                            <p className="text-xs font-bold text-slate-500 mb-2">{getTime(entry.dt)}</p>
                            <img src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`} alt="" className="w-10 h-10 mx-auto" />
                            <p className="text-base font-extrabold text-slate-800">{Math.round(entry.main.temp)}°C</p>
                            <p className="text-[10px] text-slate-400 capitalize truncate">{entry.weather[0].description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && !weatherData && (
              <div className="text-center py-16 text-slate-400">
                <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Search for a location to see weather data</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
