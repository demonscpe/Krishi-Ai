import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Bug, Activity, Download, TrendingUp, Sprout } from 'lucide-react';

export default function DiseaseHistoryDashboard() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${base}/api/disease-history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to load history');
        const data = await res.json();
        setHistory(data.records || []);
        setStats(data.stats || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Loading history...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl flex items-center gap-3"><BarChart3 className="text-lime-300" /> Disease History</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">Track and analyze your plant disease detection history.</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <Sprout size={20} className="text-emerald-500 mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">{stats.total_records || 0}</p>
              <p className="text-xs text-slate-500">Total Checks</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <Bug size={20} className="text-red-500 mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">{stats.most_frequent_disease || 'N/A'}</p>
              <p className="text-xs text-slate-500">Most Common Disease</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <Sprout size={20} className="text-orange-500 mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">{stats.most_frequent_crop || 'N/A'}</p>
              <p className="text-xs text-slate-500">Most Affected Crop</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <TrendingUp size={20} className="text-blue-500 mb-2" />
              <p className="text-2xl font-extrabold text-slate-800">{stats.healthy_percentage || 0}%</p>
              <p className="text-xs text-slate-500">Healthy Rate</p>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Detection Records</h2>
            <span className="text-xs text-slate-400">{history.length} entries</span>
          </div>
          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No detection history yet.</p>
              <p className="text-sm">Start by detecting a disease in the Disease Detection module.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Plant</th>
                    <th className="px-6 py-3 text-left">Disease</th>
                    <th className="px-6 py-3 text-left">Severity</th>
                    <th className="px-6 py-3 text-left">Treatment</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-600">{record.date || '--'}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{record.plant || '--'}</td>
                      <td className="px-6 py-4">{record.disease || '--'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                          record.severity === 'Low' ? 'bg-green-100 text-green-700' :
                          record.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          record.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>{record.severity || '--'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{record.treatment || '--'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${record.recovery_status === 'Recovered' ? 'text-green-600' : 'text-amber-600'}`}>
                          {record.recovery_status || '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                          <Download size={12} /> PDF
                        </button>
                      </td>
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

