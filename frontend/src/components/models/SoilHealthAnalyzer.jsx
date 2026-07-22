import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Loader2, ArrowLeft, Sparkles, CheckCircle2, 
  Leaf, AlertTriangle, TrendingUp, AlertCircle
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const getScoreColor = (score) => {
  if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200', label: 'Excellent', icon: CheckCircle2 };
  if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200', label: 'Good', icon: TrendingUp };
  if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200', label: 'Fair', icon: AlertTriangle };
  return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200', label: 'Poor', icon: AlertCircle };
};

const NutrientCard = ({ nutrient, value, status, reason, recommendation, confidence }) => {
  const statusColors = {
    Optimal: { bg: 'bg-green-100 text-green-700', icon: '✅' },
    Low: { bg: 'bg-red-100 text-red-700', icon: '⚠️' },
    High: { bg: 'bg-amber-100 text-amber-700', icon: '📈' },
  };

  const sc = statusColors[status] || statusColors.Optimal;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-extrabold text-slate-800">{nutrient}</h4>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${sc.bg}`}>
          {sc.icon} {status}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Value</span>
          <span className="font-bold text-slate-800">{value}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Reason</span>
          <span className="font-medium text-slate-700 text-right max-w-[60%]">{reason}</span>
        </div>
        <div className="border-t border-slate-100 pt-2 mt-2">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Recommendation</p>
          <p className="text-slate-600 leading-relaxed">{recommendation}</p>
        </div>
      </div>
    </div>
  );
};

const SoilHealthAnalyzer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/soil-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Backend fetches latest stored values
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze soil health. Please save soil test values first.');
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColors = result ? getScoreColor(result.score) : null;

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate('/soil')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Soil Hub
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> AI health assessment
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI Soil Health Analyzer
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Get a comprehensive health score with per-nutrient breakdown and actionable recommendations.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          <div className="p-5 sm:p-8 lg:p-10">
            {/* Action button */}
            {!result && !isLoading && (
              <div className="text-center py-10">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <Activity className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Ready to analyze your soil health?</h2>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  We'll use your latest saved soil test values to compute a detailed health score with per-nutrient analysis.
                </p>
                <button
                  onClick={handleAnalyze}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
                >
                  <Activity size={18} /> Analyze Soil Health
                </button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
                <p className="text-lg font-bold text-slate-700">Analyzing soil health...</p>
                <p className="text-sm text-slate-400 mt-1">Computing nutrient scores and recommendations</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2 max-w-xl mx-auto my-8">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-8">
                {/* Big Score Display */}
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Overall Soil Health Score</p>
                  <div className={`inline-flex items-center gap-4 rounded-2xl border ${scoreColors.border} ${scoreColors.light} px-8 py-6`}>
                    <div className={`text-6xl font-black ${scoreColors.text}`}>{result.score}</div>
                    <div className="text-left">
                      <div className="text-xl font-extrabold text-slate-800">/ 100</div>
                      <div className={`inline-flex items-center gap-1 mt-1 rounded-full px-3 py-1 text-sm font-bold ${scoreColors.bg} text-white`}>
                        <scoreColors.icon size={16} /> {scoreColors.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 p-5">
                    <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
                  </div>
                )}

                {/* Nutrient Breakdown */}
                {result.breakdown && result.breakdown.length > 0 && (
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">Per-Nutrient Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.breakdown.map((item) => (
                        <NutrientCard key={item.nutrient} {...item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleAnalyze}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    <Activity size={16} /> Re-analyze
                  </button>
                  <button
                    onClick={() => navigate('/soil/fertilizer')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Get Fertilizer Recommendation →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info section */}
        {!result && (
          <div className="mt-8 bg-gradient-to-br from-emerald-700 to-green-600 rounded-3xl p-8 sm:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles size={14} className="text-lime-300" /> How it works
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                {[
                  { step: '1', title: 'Save soil test values', desc: 'Enter or upload your lab report data' },
                  { step: '2', title: 'AI analyzes each nutrient', desc: 'Compares against optimal ranges with rules + ML' },
                  { step: '3', title: 'Get score + action plan', desc: 'Health score + per-nutrient recommendations' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-black mb-3">
                      {item.step}
                    </div>
                    <h4 className="text-base font-extrabold mb-1">{item.title}</h4>
                    <p className="text-sm text-emerald-50/80">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SoilHealthAnalyzer;

