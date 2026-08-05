import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Store, Leaf, Mic, X, ArrowLeft, TrendingUp } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR = ['Tomato', 'Mango', 'Coconut', 'Guava', 'Papaya', 'Chilli', 'Kuppam', 'Palamaner'];

const SmartSearch = () => {
  const navigate = useNavigate();
  const { fetchSuggestions, suggestions, runSearch, setSearchResults } = useNursery();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

const submit = (e) => {
    e.preventDefault();
    // Navigate immediately — the results page fetches the search itself.
    // This guarantees the user always gets redirected even if the API is slow.
    const q = query.trim();
    if (!q) return;
    runSearch(q); // fire-and-forget warm-up
    navigate(`/nursery/results?q=${encodeURIComponent(q)}`);
  };

  const pickSuggestion = (type, label) => {
    const q = label;
    if (!q) return;
    runSearch(q); // fire-and-forget warm-up
    navigate(`/nursery/results?q=${encodeURIComponent(q)}`);
  };

  const hasSuggestion = suggestions.locations.length > 0 || suggestions.nurseries.length > 0 || suggestions.crops.length > 0;

  return (
    <div className="relative min-h-screen bg-[#f7faf8] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/nursery/marketplace')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft size={20} />
          </button>
          <form onSubmit={submit} className="flex-1 flex items-center gap-2 rounded-2xl bg-white/95 text-slate-800 px-3 py-2 shadow-md">
            <Search size={18} className="text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search nurseries, crops, locations..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')}><X size={16} className="text-slate-400" /></button>
            )}
            <button type="button" onClick={() => window.webkitSpeechRecognition && startVoice(setQuery)} className="text-green-600">
              <Mic size={18} />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Live suggestions */}
        <AnimatePresence>
          {focused && hasSuggestion && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden mb-4">
              {suggestions.locations.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Locations</p>
                  {suggestions.locations.map((l) => (
                    <button key={l.name} onMouseDown={() => pickSuggestion('location', l.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/30 text-left">
                      <MapPin size={18} className="text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{l.name}</p>
                        <p className="text-xs text-slate-400">{l.district} district</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.nurseries.length > 0 && (
                <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Nurseries</p>
                  {suggestions.nurseries.map((n) => (
                    <button key={n.id} onMouseDown={() => pickSuggestion('nursery', n.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/30 text-left">
                      <Store size={18} className="text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.name}</p>
                        <p className="text-xs text-slate-400">{n.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.crops.length > 0 && (
                <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Crops</p>
                  {suggestions.crops.map((c) => (
                    <button key={c.plantId} onMouseDown={() => pickSuggestion('crop', c.plantName)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/30 text-left">
                      <Leaf size={18} className="text-lime-600" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.plantName} <span className="text-xs font-normal text-slate-400">Seedlings in {c.nurseryName}</span></p>
                        <p className="text-xs text-slate-400">{c.category} · ₹{c.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popular searches */}
        {!query && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
              <TrendingUp size={16} className="text-green-600" /> Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((p) => (
                <button key={p} onClick={() => setQuery(p)}
                  className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
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

export default SmartSearch;
