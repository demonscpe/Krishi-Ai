import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, List, Map as MapIcon, Store, Leaf, Star } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { NurseryCard, CropCard } from './ui/Cards';
import FilterSheet from './FilterSheet';
import { SectionSkeleton } from './ui/Shimmer';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { runSearch, searchResults, searching, filters, setFilters, darkMode, setDarkMode } = useNursery();
  const [showFilter, setShowFilter] = useState(false);
  const [view, setView] = useState('list');

  useEffect(() => {
    runSearch(query);
  }, [query]);

  const intent = searchResults?.intent?.type;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-[#f7faf8]'} transition-colors`}>
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-bold text-sm">Results for "{query}"</h1>
            {searchResults && <p className="text-xs text-emerald-100/80">{searchResults.totalNurseries} nurseries · {searchResults.totalCrops} crops</p>}
          </div>
          <button onClick={() => setShowFilter(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><SlidersHorizontal size={18} /></button>
          <div className="flex rounded-full bg-white/10 p-0.5">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-full ${view === 'list' ? 'bg-white text-green-700' : 'text-white'}`}><List size={16} /></button>
            <button onClick={() => navigate('/nursery/map')} className={`p-1.5 rounded-full ${view === 'map' ? 'bg-white text-green-700' : 'text-white'}`}><MapIcon size={16} /></button>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white/10">{darkMode ? '🔆' : '🌙'}</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        {searching || !searchResults ? (
          <SectionSkeleton count={6} />
        ) : (
          <div>
            {/* Intent badge */}
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 font-semibold">
                {intent === 'location' ? '📍 Location' : intent === 'crop' ? '🌱 Crop' : intent === 'location_crop' ? '📍 + 🌱 Location & Crop' : '🏪 Nursery'}
              </span>
              <span className="text-slate-400">AI detected your search intent</span>
            </div>

            {/* Crops section (Amazon-style: products first) */}
            {searchResults.crops?.length > 0 && (
              <section className="mb-10">
                <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
                  <Leaf size={18} className="text-lime-600" /> Plants ({searchResults.crops.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.crops.map((c) => <CropCard key={c.plantId} crop={c} />)}
                </div>
              </section>
            )}

            {/* Related nurseries section (sellers) */}
            {searchResults.nurseries?.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
                  <Store size={18} className="text-green-600" /> Related Nurseries ({searchResults.nurseries.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.nurseries.map((n) => <NurseryCard key={n.id} nursery={n} />)}
                </div>
              </section>
            )}

            {searchResults.crops?.length === 0 && searchResults.nurseries?.length === 0 && (
              <div className="text-center py-20">
                <Store size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-semibold">No results for "{query}"</p>
                <p className="text-sm text-slate-400 mt-1">Try searching a different crop, nursery, or location.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <FilterSheet open={showFilter} onClose={() => setShowFilter(false)} />
    </div>
  );
};

export default SearchResults;
