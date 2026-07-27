import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, Loader2, ArrowLeft, Sparkles, CheckCircle2, 
  Leaf, FlaskConical, Droplets, AlertCircle
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const FertilizerRecommendation = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/fertilizer-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Backend uses latest saved soil + crop data
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to get fertilizer recommendations. Please save soil test values first.');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Sparkles size={14} className="text-lime-300" /> AI fertilizer planning
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Fertilizer Recommendation
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Get personalized fertilizer recommendations with exact quantities per acre based on your soil and crop.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          <div className="p-5 sm:p-8 lg:p-10">
            {/* Initial state */}
            {!result && !isLoading && (
              <div className="text-center py-10">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                  <Sprout className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Ready for fertilizer recommendations?</h2>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  We'll analyze your soil test values and recommended crop to create a precise fertilizer plan.
                </p>
                <button
                  onClick={handleGetRecommendations}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700"
                >
                  <Sprout size={18} /> Get Fertilizer Recommendations
                </button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={40} className="animate-spin text-amber-600 mb-4" />
                <p className="text-lg font-bold text-slate-700">Computing fertilizer plan...</p>
                <p className="text-sm text-slate-400 mt-1">Analyzing NPK deficiencies and crop requirements</p>
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
                {/* Crop info */}
                {result.crop && (
                  <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Recommended Crop</p>
                    <p className="text-2xl font-extrabold text-slate-800">{result.crop}</p>
                  </div>
                )}

                {/* Fertilizers */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4">Recommended Fertilizers</h3>
                  {result.fertilizers && result.fertilizers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.fertilizers.map((fert, index) => (
                        <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:border-amber-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100">
                              <FlaskConical className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-slate-800">{fert.name}</h4>
                              <p className="text-xs text-slate-400">{fert.type || 'Fertilizer'}</p>
                            </div>
                          </div>
                          <p className="text-2xl font-black text-amber-600">{fert.quantity_per_acre}</p>
                          {fert.notes && (
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">{fert.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-6 text-center">
                      <p className="text-sm text-slate-500">Your soil nutrient levels are sufficient. No additional fertilizers needed.</p>
                    </div>
                  )}
                </div>

                {/* Application Schedule */}
                {result.schedule && (
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">Application Schedule</h3>
                    <div className="space-y-3">
                      {result.schedule.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green-100 text-sm font-black text-green-700">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.stage}</p>
                            <p className="text-xs text-slate-500 mt-1">{item.instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Re-analyze */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleGetRecommendations}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700"
                  >
                    <Sprout size={16} /> Re-calculate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        {!result && (
          <div className="mt-8 bg-gradient-to-br from-amber-700 to-orange-600 rounded-3xl p-8 sm:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles size={14} className="text-lime-300" /> Smart fertilization
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                {[
                  { icon: FlaskConical, title: 'ML-based selection', desc: 'XGBoost chooses best fertilizer type' },
                  { icon: Droplets, title: 'Rule-based quantities', desc: 'Exact kg/acre based on deficiency' },
                  { icon: Leaf, title: 'Organic options', desc: 'Includes organic alternatives' },
                ].map((item) => (
                  <div key={item.title} className="text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 mb-3">
                      <item.icon size={20} />
                    </div>
                    <h4 className="text-base font-extrabold mb-1">{item.title}</h4>
                    <p className="text-sm text-amber-50/80">{item.desc}</p>
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

export default FertilizerRecommendation;

