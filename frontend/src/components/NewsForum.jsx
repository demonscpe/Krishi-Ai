import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Search, ExternalLink, Calendar } from 'lucide-react';
import bgHero from "../assets/bgHero.png";

const Card = ({ article }) => (
  <a href={article.url} target="_blank" rel="noopener noreferrer"
    className="group rounded-2xl bg-white border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="h-44 overflow-hidden bg-slate-100">
      {article.urlToImage ? (
        <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">📰</div>
      )}
    </div>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{article.source?.name || 'News'}</span>
        {article.publishedAt && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={11} />{new Date(article.publishedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">{article.title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{article.description}</p>
      <div className="flex items-center gap-1 text-xs font-bold text-green-600 group-hover:gap-2 transition-all">
        Read More <ExternalLink size={12} />
      </div>
    </div>
  </a>
);

export default function NewsForum() {
  const [search, setSearch] = useState('agriculture');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customSearch, setCustomSearch] = useState('');
  const API_KEY = '823eff063e324ab1a016abf49b309b75';

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(search)}&apiKey=${API_KEY}`);
      const jsonData = await response.json();
      setNewsData(jsonData.articles?.slice(0, 12) || []);
    } catch { setNewsData([]); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { getData(); }, [getData]);

  const categories = [
    { name: 'Smart Agriculture', search: 'smart agriculture technology' },
    { name: 'AI in Farming', search: 'artificial intelligence agriculture' },
    { name: 'Precision Farming', search: 'precision agriculture technology' },
    { name: 'Farm Robotics', search: 'agricultural robotics automation' },
    { name: 'Climate Tech', search: 'climate smart agriculture technology' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Premium agri-tech intelligence
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              News Forum
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Explore the latest AI breakthroughs, precision tools, robotics, and climate-smart innovations shaping the future of farming.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
              <input type="text" value={customSearch} onChange={(e) => setCustomSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && customSearch.trim() && setSearch(customSearch.trim())}
                placeholder="Search agri-tech topics..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100" />
              <button onClick={() => customSearch.trim() && setSearch(customSearch.trim())}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all shadow-md">
                <Search size={16} /> Search
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((cat, i) => (
                <button key={i} onClick={() => { setSearch(cat.search); setCustomSearch(''); }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    search === cat.search ? 'bg-green-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="text-sm text-slate-500">Gathering fresh news...</p>
              </div>
            ) : newsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData.map((article, i) => <Card key={i} article={article} />)}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Search size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">No articles found for that category.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
