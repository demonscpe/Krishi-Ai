import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Bell, User, Search, Mic, Leaf, Store, Star,
  Truck, Timer, Heart, ChevronRight, Sparkles, Award,
  RefreshCw, SlidersHorizontal, ShoppingBag, Navigation,
} from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { SectionSkeleton } from './ui/Shimmer';
import { motion, AnimatePresence } from 'framer-motion';

const CHIPS = [
  { label: 'Nearby', icon: MapPin },
  { label: 'Vegetables', icon: Leaf },
  { label: 'Fruit Plants', icon: Leaf },
  { label: 'Flower Plants', icon: Sparkles },
  { label: 'Medicinal', icon: Leaf },
  { label: 'Forest', icon: Store },
  { label: 'Organic', icon: Leaf },
  { label: 'Open Now', icon: Timer },
  { label: 'Delivery', icon: Truck },
  { label: 'Highly Rated', icon: Star },
];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80';

const NurseryMarketplace = () => {
  const navigate = useNavigate();
  const { feed, feedLoading, loadFeed, loadCategories, setLocation, darkMode, setDarkMode, cart } = useNursery();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [locLabel, setLocLabel] = useState('Detect location');
  const touchY = useRef(null);

  useEffect(() => {
    loadCategories();
    detectLocation();
  }, []);

useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocLabel(loc.lat.toFixed(2) + ', ' + loc.lng.toFixed(2));
      },
      () => setLocLabel('Kuppam, Chittoor')
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setTimeout(() => setRefreshing(false), 600);
  };

  const onTouchStart = (e) => { touchY.current = e.touches[0].clientY; };
  const onTouchEnd = async (e) => {
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (dy > 90 && window.scrollY === 0) onRefresh();
  };

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/nursery/results?q=${encodeURIComponent(query)}`);
  };

  const handleChip = (label) => {
    navigate(`/nursery/results?q=${encodeURIComponent(label)}`);
  };

  const renderSection = (title, icon, items, type) => {
    if (!items || items.length === 0) return null;
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
              {icon}
            </span>
            {title}
          </h2>
          <button onClick={() => navigate(`/nursery/results?q=${title}`)} className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:gap-2 transition-all">
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-hide">
          {items.map((item) => (
            <motion.button
              key={item.id || item.plantId}
              whileHover={{ y: -4 }}
              onClick={() => type === 'nursery' ? navigate(`/nursery/profile/${item.id}`) : navigate(`/nursery/crop/${item.plantId}`)}
              className="snap-start shrink-0 w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden text-left shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative h-28">
                <img src={item.imageUrl || item.coverImage || FALLBACK_IMG} alt="" className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/50 text-white text-[10px] px-2 py-0.5 backdrop-blur">
                  <MapPin size={10} /> {item.distance_km ? `${item.distance_km.toFixed(1)} km` : 'Nearby'}
                </span>
              </div>
              <div className="p-3">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{item.plantName || item.nurseryName}</p>
                <p className="text-xs text-slate-400 line-clamp-1">{item.category || item.address}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star size={12} fill="currentColor" /> <span className="text-slate-600 dark:text-slate-300">{item.rating ? item.rating.toFixed(1) : '—'}</span>
                  </div>
                  {item.price ? <span className="text-sm font-bold text-green-600">₹{item.price}</span> : null}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div dir="ltr" className={`min-h-screen pb-24 ${darkMode ? 'dark bg-slate-950' : 'bg-[#f7faf8]'} transition-colors`}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-extrabold leading-tight flex items-center gap-1.5">
                <Leaf size={20} className="text-lime-300" /> Nursery Marketplace
              </h1>
              <button onClick={detectLocation} className="flex items-center gap-1 text-xs text-emerald-100/90 mt-0.5">
                <MapPin size={12} /> <span className="truncate">{locLabel}</span>
              </button>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <RefreshCw size={18} className={darkMode ? 'text-yellow-300' : ''} />
            </button>
            <button onClick={() => navigate('/nursery/cart')} className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">{cart.length}</span>
              )}
            </button>
            <button onClick={() => navigate('/nursery/notifications')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Bell size={18} />
            </button>
            <button onClick={() => navigate('/profile')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md px-4 py-3 backdrop-blur bg-opacity-80">
          <Search size={20} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Nurseries, Crops, Locations..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button type="submit" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/40 dark:text-green-300 px-3 py-1.5 rounded-lg">
            Search
          </button>
          <button type="button" onClick={() => window.webkitSpeechRecognition && startVoice(setQuery)} className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300">
            <Mic size={18} />
          </button>
        </form>

        {/* Chips */}
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {CHIPS.map((chip) => {
            const Icon = chip.icon;
            return (
              <button key={chip.label} onClick={() => handleChip(chip.label)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 hover:border-green-300 transition-colors">
                <Icon size={13} /> {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div className="flex justify-center py-2">
          <RefreshCw size={20} className="animate-spin text-green-600" />
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4">
        {feedLoading && !feed ? (
          <SectionSkeleton count={6} />
        ) : feed ? (
          <div>
            {/* Offers banner */}
            {feed.offers?.length > 0 && (
              <section className="mb-8 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">Deals of the week</p>
                    <h3 className="text-xl font-extrabold mt-1">Fresh Seedlings at Lowest Prices</h3>
                    <button onClick={() => navigate('/nursery/results?q=offers')} className="mt-3 inline-flex items-center gap-1 bg-white text-red-600 text-sm font-bold px-4 py-2 rounded-xl">
                      Shop now <ChevronRight size={16} />
                    </button>
                  </div>
                  <Sparkles size={48} className="opacity-40 hidden sm:block" />
                </div>
              </section>
            )}

            {renderSection('Nearby Nurseries', <MapPin size={18} />, feed.nearbyNurseries, 'nursery')}
            {renderSection('Popular Crops', <Award size={18} />, feed.popularCrops)}
            {renderSection('Recommended For You', <Sparkles size={18} />, feed.recommendedForYou)}
            {renderSection('Recently Viewed', <RefreshCw size={18} />, feed.recentlyViewed)}
            {renderSection('Featured Nurseries', <Store size={18} />, feed.featuredNurseries, 'nursery')}
          </div>
        ) : (
          <div className="text-center py-20">
            <Store size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400">No data yet. Register a nursery or add crops to get started.</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/nursery/map')}
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-green-600 text-white shadow-xl shadow-green-600/40 flex items-center justify-center"
      >
        <Navigation size={24} />
      </motion.button>
    </div>
  );
};

function startVoice(setQuery) {
  const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
  if (!SR) return;
  const rec = new SR();
  rec.lang = 'en-IN';
  rec.onresult = (e) => setQuery(e.results[0][0].transcript);
  rec.start();
}

export default NurseryMarketplace;
