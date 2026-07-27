import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Sparkles } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const NurserySearch = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate('/nursery')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Nursery Hub
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Browse nurseries
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Browse Nurseries</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80">Search for nearby nurseries, plants, and seedlings.</p>
          </div>
        </div>
      </section>
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-10 text-center">
          <Search size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Nursery search coming soon</h2>
          <p className="text-sm text-slate-400 mt-2">This feature is under development.</p>
        </div>
      </main>
    </div>
  );
};

export default NurserySearch;

