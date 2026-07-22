import React, { useEffect, useState, useCallback } from 'react';
import Card from './NewsCard';

export default function NewsForum() {
  const [search, setSearch] = useState('agriculture');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_KEY = '823eff063e324ab1a016abf49b309b75';

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(search)}&apiKey=${API_KEY}`
      );
      const jsonData = await response.json();
      setNewsData(jsonData.articles?.slice(0, 12) || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { getData(); }, [getData]);

  const categories = [
    { name: 'Agriculture', search: 'smart agriculture' },
    { name: 'Organic Farming', search: 'organic farming' },
    { name: 'Crops', search: 'crops' },
    { name: 'Livestock', search: 'livestock' },
    { name: 'Policies', search: 'agriculture policies' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 font-poppins bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">
            Agriculture News
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">
            Latest in Agriculture
          </h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
          <p className="mt-4 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Stay informed with the latest news, trends, and innovations in modern agriculture.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSearch(cat.search)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                search === cat.search
                  ? 'bg-green-700 text-white shadow-md'
                  : 'bg-white text-green-800 hover:bg-green-50 border border-green-100 shadow-sm'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-700" />
            <p className="text-sm text-green-800 font-medium animate-pulse">Gathering fresh news...</p>
          </div>
        ) : newsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsData.map((article, i) => (
              <Card key={i} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-base text-slate-400 font-medium">No articles found for that category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
