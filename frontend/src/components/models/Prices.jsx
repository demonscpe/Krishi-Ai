import { Link } from 'react-router-dom';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Clock, ArrowUp, ArrowDown, ArrowUpDown, WifiOff } from 'lucide-react';
import gain from '../../assets/images/gain-icon.png';
import loss from '../../assets/images/loss-icon.png';
import CropImages from './CropImages';

const EMPTY_DATA = {
  top_gainers: [],
  top_losers: [],
  six_months_forecast: [],
};

// Allow the API origin to be overridden per environment without touching code.
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CROP_API_URL) ||
  'http://localhost:8000';

// Optional auth for the price API. Set VITE_AGROTECH_API_KEY in your .env file
// (never hardcode a real key in source). Supports either an "x-api-key" header
// (default) or a Bearer token — flip AUTH_SCHEME if your API expects the latter.
const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AGROTECH_API_KEY) || '';
const AUTH_SCHEME = 'x-api-key'; // 'x-api-key' | 'bearer'

function buildAuthHeaders() {
  if (!API_KEY) return {};
  return AUTH_SCHEME === 'bearer'
    ? { Authorization: `Bearer ${API_KEY}` }
    : { 'x-api-key': API_KEY };
}

const REFRESH_INTERVAL_MS = 60_000; // background refresh every 60s
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

/* ======================================================================
   RESILIENT FETCH LAYER
   - times out slow requests instead of hanging forever
   - retries transient failures with backoff
   - respects an external AbortSignal for cleanup on unmount
   ====================================================================== */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, { retries = MAX_RETRIES, timeoutMs = REQUEST_TIMEOUT_MS, signal } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const onExternalAbort = () => controller.abort();
    if (signal) signal.addEventListener('abort', onExternalAbort);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json', ...buildAuthHeaders() },
      });
      if (response.status === 401 || response.status === 403) {
        // Don't retry auth failures — retrying with the same bad/missing key won't help.
        throw new Error('AUTH');
      }
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      return await response.json();
    } catch (err) {
      if (err.message === 'AUTH') throw err;
      lastError = err;
      // A real unmount/cancel should stop immediately, not retry.
      if (signal?.aborted) throw err;
      if (attempt < retries) await sleep(600 * (attempt + 1));
    } finally {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onExternalAbort);
    }
  }

  throw lastError;
}

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/* ======================================================================
   SEARCH ALGORITHM (shared shape with the crop-rotation search bar)
   Ranks commodities against partial/fuzzy input instead of a plain
   substring check, and tolerates small typos.
   ====================================================================== */

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function isSubsequence(query, target) {
  let qi = 0;
  for (let i = 0; i < target.length && qi < query.length; i++) {
    if (target[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

function scoreMatch(query, target) {
  const q = query.trim().toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 1;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90 - (t.length - q.length);
  if (t.includes(q)) return 70 - (t.length - q.length);
  if (isSubsequence(q, t)) return 45;
  const dist = levenshtein(q, t);
  if (dist <= 2) return 30 - dist * 8;
  return -1;
}

function highlightMatch(text, query) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-green-200 text-green-900 rounded-sm px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */

const Prices = () => {
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [receivedData, setReceivedData] = useState(EMPTY_DATA);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState('');
  const [, forceTick] = useState(0); // re-renders "x ago" label periodically
  const abortRef = useRef(null);

  const loadData = useCallback(async ({ background = false } = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (background) setRefreshing(true); else setFetching(true);
    setError(null);

    try {
      const data = await fetchJsonWithRetry(`${API_BASE}/api/prices/overview`, { signal: controller.signal });
      setReceivedData({
        top_gainers: Array.isArray(data?.top_gainers) ? data.top_gainers : [],
        top_losers: Array.isArray(data?.top_losers) ? data.top_losers : [],
        six_months_forecast: Array.isArray(data?.six_months_forecast) ? data.six_months_forecast : [],
      });
      setLastUpdated(new Date());
    } catch (err) {
      if (err?.name === 'AbortError') {
        // component unmounted or a newer request superseded this one — ignore
      } else if (err?.message === 'AUTH') {
        setError('API key missing or rejected. Check VITE_AGROTECH_API_KEY and try again.');
      } else {
        setError("Couldn't load live market data. Please try refreshing.");
      }
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const refreshId = setInterval(() => loadData({ background: true }), REFRESH_INTERVAL_MS);
    const tickId = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => {
      clearInterval(refreshId);
      clearInterval(tickId);
      abortRef.current?.abort();
    };
  }, [loadData]);

  const forecast = receivedData.six_months_forecast[0];

  const filteredCrops = useMemo(() => {
    if (!search.trim()) return CropImages;
    return CropImages
      .map((crop) => ({ crop, score: scoreMatch(search, crop.crop_name) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.crop.crop_name.localeCompare(b.crop.crop_name))
      .map((r) => r.crop);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">
            Live Market
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Market <span className="text-green-600">Insights</span>
          </h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
          <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Real-time commodity price forecasting and market trends for Indian agriculture.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-400">
            {lastUpdated && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> Updated {timeAgo(lastUpdated)}
              </span>
            )}
            <button
              type="button"
              onClick={() => loadData({ background: true })}
              disabled={fetching || refreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-green-400 hover:text-green-700 disabled:opacity-50"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-5 py-4 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2"><WifiOff size={16} /> {error}</span>
            <button
              type="button"
              onClick={() => loadData()}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {fetching && (
          <div className="grid lg:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-14 bg-gray-200" />
                <div className="p-6 space-y-3">
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} className="h-10 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!fetching && (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              <PriceTable
                title="Top Gainers" badge="Bullish"
                headerColor="bg-green-600" badgeColor="bg-green-400/30"
                rowHover="hover:bg-green-50/50"
                data={receivedData.top_gainers} sign="+"
                valueColor="text-green-600"
                emptyText="No gainers reported right now."
              />
              <PriceTable
                title="Top Losers" badge="Bearish"
                headerColor="bg-red-500" badgeColor="bg-red-400/30"
                rowHover="hover:bg-red-50/50"
                data={receivedData.top_losers} sign="-"
                valueColor="text-red-500"
                emptyText="No losers reported right now."
              />
            </div>

            {forecast && (
              <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-green-300 font-roboto">
                      AI Forecast
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold">Star Crop Forecast</h2>
                    <p className="text-green-100 text-sm max-w-sm leading-relaxed">
                      AI highlights these crops for significant price shifts in the coming month.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto md:min-w-[400px]">
                    <ForecastCard
                      label="High Growth" labelColor="text-green-300"
                      name={forecast[1]} price={forecast[2]} pct={forecast[3]}
                      icon={gain} pctColor="text-green-300"
                    />
                    <ForecastCard
                      label="Correction" labelColor="text-red-300"
                      name={forecast[4]} price={forecast[5]} pct={forecast[6]}
                      icon={loss} pctColor="text-red-300"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1 font-roboto">
                    Commodities
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                    Market Exploration
                  </h3>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search a commodity... (typos ok)"
                  autoComplete="off"
                  className="w-full sm:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                />
              </div>

              {filteredCrops.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10">
                  No commodities match "{search}".
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredCrops.map((crop) => (
                    <Link
                      key={crop.crop_name}
                      to={`/reports?crop=${crop.crop_name}`}
                      className="group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:border-green-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-2"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300" />
                        <img
                          src={crop.crop_image}
                          alt={crop.crop_name}
                          className="relative z-10 rounded-full h-10 w-10 sm:h-12 sm:w-12 object-cover border-2 border-gray-50"
                        />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-600 group-hover:text-green-700 capitalize text-center leading-tight">
                        {highlightMatch(crop.crop_name, search)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ======================================================================
   SORTABLE PRICE TABLE
   Click a column header to sort by commodity name, price, or % change.
   Clicking the same column again flips the direction.
   ====================================================================== */

const PriceTable = ({ title, badge, headerColor, badgeColor, rowHover, data, sign, valueColor, emptyText }) => {
  const [sortKey, setSortKey] = useState(null); // 'name' | 'price' | 'change'
  const [sortDir, setSortDir] = useState('desc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      let av, bv;
      if (sortKey === 'name') { av = a[0]; bv = b[0]; }
      else if (sortKey === 'price') { av = Number(a[1]); bv = Number(b[1]); }
      else { av = Math.abs(a[2]); bv = Math.abs(b[2]); }

      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`${headerColor} px-5 py-4 flex justify-between items-center`}>
        <h2 className="text-base font-bold text-white">{title}</h2>
        <span className={`${badgeColor} text-white text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider`}>
          {badge}
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-slate-400 text-xs uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-5 py-3 text-left">
                  <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Commodity <SortIcon column="name" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button type="button" onClick={() => toggleSort('price')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Price (₹) <SortIcon column="price" />
                  </button>
                </th>
                <th className="px-5 py-3 text-right">
                  <button type="button" onClick={() => toggleSort('change')} className="flex items-center gap-1 ml-auto hover:text-slate-600 transition-colors">
                    Trend <SortIcon column="change" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedData.map((item, i) => (
                <tr key={`${item[0]}-${i}`} className={`${rowHover} transition-colors`}>
                  <td className="px-5 py-3 font-semibold text-sm text-slate-700 whitespace-nowrap">{item[0]}</td>
                  <td className="px-5 py-3 text-sm text-slate-500 whitespace-nowrap">₹{item[1]}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <span className={`${valueColor} font-bold text-sm`}>{sign}{Math.abs(item[2])}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ForecastCard = ({ label, labelColor, name, price, pct, icon, pctColor }) => (
  <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-white/20">
    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 font-roboto ${labelColor}`}>{label}</p>
    <h4 className="text-base font-bold truncate">{name ?? '—'}</h4>
    <div className="flex items-end gap-2 mt-2 flex-wrap">
      <span className="text-2xl font-black">₹{price ?? '—'}</span>
      {pct != null && (
        <span className={`flex items-center text-sm font-bold mb-0.5 ${pctColor}`}>
          {Math.abs(pct)}%
          <img src={icon} className="h-4 w-4 ml-1" alt="" />
        </span>
      )}
    </div>
  </div>
);

export default Prices;