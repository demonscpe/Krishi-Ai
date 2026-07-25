import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, ArrowLeft, Sparkles,
  Filter, Calendar, Sprout, Beaker, Activity, Droplets
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const ANALYSIS_TYPES = ['Dashboard', 'Image Analysis', 'Test Input', 'Health Analyzer', 'Fertilizer', 'Quality Prediction'];
const TIME_PERIODS = [
  { value: 'all', label: 'All Time' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
];

export default function SoilDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisFilter, setAnalysisFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all');
  const [records] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading soil dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate('/soil')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Soil Hub
          </button>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
            <Sparkles size={14} className="text-lime-300" /> Analytics & Dashboard
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl flex items-center gap-3">
            <BarChart3 className="text-lime-300" /> Soil Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">
            Track and analyze your soil health data, test results, and recommendations.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
        )}

        {/* Filter Bar */}
        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm">
            <Filter size={16} className="text-slate-400" />
            <select
              value={analysisFilter}
              onChange={(e) => setAnalysisFilter(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              {ANALYSIS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'Dashboard' ? 'Dashboard' : type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm">
            <Calendar size={16} className="text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              {TIME_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-slate-500 ml-auto">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <Beaker size={20} className="text-emerald-500 mb-2" />
            <p className="text-2xl font-extrabold text-slate-800">--</p>
            <p className="text-xs text-slate-500">Total Analyses</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <Activity size={20} className="text-blue-500 mb-2" />
            <p className="text-2xl font-extrabold text-slate-800">--</p>
            <p className="text-xs text-slate-500">Avg Health Score</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <Sprout size={20} className="text-amber-500 mb-2" />
            <p className="text-lg font-extrabold text-slate-800">--</p>
            <p className="text-xs text-slate-500">Most Common Soil</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <Droplets size={20} className="text-purple-500 mb-2" />
            <p className="text-lg font-extrabold text-slate-800">--</p>
            <p className="text-xs text-slate-500">Last Analysis</p>
          </div>
        </div>

        {/* Records Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Soil Analysis Records</h2>
            <span className="text-xs text-slate-400">{records.length} entries</span>
          </div>
          {records.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No soil analysis records found.</p>
              <p className="text-sm">Complete a soil analysis in any Soil Hub module to see data here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Analysis Type</th>
                    <th className="px-6 py-3 text-left">Key Metrics</th>
                    <th className="px-6 py-3 text-left">Results</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-600">{record.date || '--'}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{record.type || '--'}</td>
                      <td className="px-6 py-4 text-slate-600">{record.metrics || '--'}</td>
                      <td className="px-6 py-4 text-slate-600">{record.result || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
