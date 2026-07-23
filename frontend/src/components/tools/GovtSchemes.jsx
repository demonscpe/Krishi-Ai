import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Search, Filter, ArrowLeft, Sparkles, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const CATEGORIES = ['all', 'subsidy', 'insurance', 'loan', 'equipment'];

const GovtSchemes = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    let result = schemes;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.name?.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') {
      result = result.filter(s => s.category === category);
    }
    setFilteredSchemes(result);
  }, [search, category, schemes]);

  const fetchSchemes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/tools/govt-schemes`);
      if (!res.ok) throw new Error('Failed to load schemes');
      const data = await res.json();
      setSchemes(data.schemes || []);
      setFilteredSchemes(data.schemes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Government schemes
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Govt Schemes
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Browse government agricultural schemes — subsidies, insurance, loans, and equipment support.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search schemes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      category === c 
                        ? 'bg-emerald-700 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl mb-6">
                {error}
              </div>
            )}

            {/* Schemes Grid */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchemes.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-slate-400">
                    <Landmark size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No schemes found.</p>
                    <p className="text-sm">Try a different search or category.</p>
                  </div>
                ) : (
                  filteredSchemes.map((scheme, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
                        scheme.category === 'subsidy' ? 'bg-green-500' :
                        scheme.category === 'insurance' ? 'bg-blue-500' :
                        scheme.category === 'loan' ? 'bg-purple-500' : 'bg-amber-500'
                      }`} />
                      
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3 ${
                        scheme.category === 'subsidy' ? 'bg-green-100 text-green-700' :
                        scheme.category === 'insurance' ? 'bg-blue-100 text-blue-700' :
                        scheme.category === 'loan' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {scheme.category}
                      </span>

                      <h3 className="text-lg font-extrabold text-slate-900 mb-2">{scheme.name}</h3>
                      <p className="text-sm leading-relaxed text-slate-500 mb-4">{scheme.description}</p>

                      {scheme.eligibility && (
                        <div className="bg-slate-50 rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Eligibility</p>
                          <p className="text-sm text-slate-700">{scheme.eligibility}</p>
                        </div>
                      )}

                      {scheme.benefit && (
                        <p className="text-sm font-bold text-emerald-600 mb-3">
                          Benefit: {scheme.benefit}
                        </p>
                      )}

                      {scheme.application_link && (
                        <a
                          href={scheme.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          Apply Now <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GovtSchemes;

