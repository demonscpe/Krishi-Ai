import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Leaf, Droplets, Beaker, ArrowLeft, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const CROPS = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion',
  'Groundnut', 'Soybean', 'Sunflower', 'Mustard', 'Chilli', 'Brinjal', 'Cabbage'
];

const AREA_UNITS = ['acre', 'hectare'];

const NPKCalculator = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    crop: '',
    area: '',
    area_unit: 'acre',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    target_yield: '',
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Try to pre-fill NPK from localStorage (saved soil test)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('soilTestValues');
      if (saved) {
        const data = JSON.parse(saved);
        setForm(prev => ({
          ...prev,
          nitrogen: data.nitrogen || '',
          phosphorus: data.phosphorus || '',
          potassium: data.potassium || '',
        }));
      }
    } catch {}
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleCalculate = async () => {
    if (!form.crop || !form.area) {
      setError('Please select a crop and enter field area.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const payload = {
        crop: form.crop,
        area: parseFloat(form.area),
        area_unit: form.area_unit,
        current_npk: {
          nitrogen: form.nitrogen ? parseFloat(form.nitrogen) : null,
          phosphorus: form.phosphorus ? parseFloat(form.phosphorus) : null,
          potassium: form.potassium ? parseFloat(form.potassium) : null,
        },
        target_yield: form.target_yield ? parseFloat(form.target_yield) : null,
      };

      const res = await fetch(`${base}/api/tools/npk-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Calculation failed. Please try again.');
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
              <Sparkles size={14} className="text-lime-300" /> Nutrient management
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              NPK Calculator
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Calculate the exact N-P-K nutrients your crop needs based on soil test values and target yield.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left: Form */}
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Calculator size={22} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-600">Calculator inputs</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Enter crop & soil details</h2>
                <p className="mt-1 text-sm text-slate-500">NPK values will auto-fill if you've saved soil test results.</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Crop Selection */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">Crop</label>
                <select
                  name="crop"
                  value={form.crop}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select crop...</option>
                  {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">Field Area</label>
                  <input
                    type="number"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    placeholder="e.g. 2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">Unit</label>
                  <select
                    name="area_unit"
                    value={form.area_unit}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  >
                    {AREA_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* NPK Inputs */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600 mb-3">Current Soil Nutrients (optional)</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-slate-600 mb-1">
                      <Beaker size={14} className="text-blue-500" /> N (kg/ha)
                    </label>
                    <input
                      type="number"
                      name="nitrogen"
                      value={form.nitrogen}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="e.g. 120"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-slate-600 mb-1">
                      <Droplets size={14} className="text-red-500" /> P (kg/ha)
                    </label>
                    <input
                      type="number"
                      name="phosphorus"
                      value={form.phosphorus}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                      placeholder="e.g. 45"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-slate-600 mb-1">
                      <Leaf size={14} className="text-amber-500" /> K (kg/ha)
                    </label>
                    <input
                      type="number"
                      name="potassium"
                      value={form.potassium}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                      placeholder="e.g. 35"
                    />
                  </div>
                </div>
              </div>

              {/* Target Yield */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">Target Yield (optional)</label>
                <input
                  type="number"
                  name="target_yield"
                  value={form.target_yield}
                  onChange={handleChange}
                  step="0.1"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  placeholder="e.g. 5 (tons/hectare)"
                />
              </div>

              <button
                onClick={handleCalculate}
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Calculating...</>
                ) : (
                  <><Calculator size={18} /> Calculate NPK Requirements</>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
          </section>

          {/* Right: Results */}
          <aside className="relative overflow-hidden bg-emerald-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/35 to-emerald-950/85" />
            <img src={bgHero} className="absolute inset-0 h-full w-full object-cover opacity-20" alt="" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50">
                <Calculator size={14} className="text-lime-300" /> Results
              </div>

              {result ? (
                <div className="mt-6 space-y-5">
                  {/* Required NPK */}
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-5 backdrop-blur-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-3">Required Nutrients</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-lime-300">{result.required_npk?.nitrogen || 0}</p>
                        <p className="text-xs text-emerald-200">N (kg)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-lime-300">{result.required_npk?.phosphorus || 0}</p>
                        <p className="text-xs text-emerald-200">P (kg)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-lime-300">{result.required_npk?.potassium || 0}</p>
                        <p className="text-xs text-emerald-200">K (kg)</p>
                      </div>
                    </div>
                  </div>

                  {/* Deficit/Surplus */}
                  {result.deficit && (
                    <div className="rounded-2xl bg-white/10 border border-white/20 p-5 backdrop-blur-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-3">Deficit / Surplus</p>
                      <div className="space-y-2">
                        {['nitrogen', 'phosphorus', 'potassium'].map(n => {
                          const val = result.deficit[n];
                          const isDeficit = val < 0;
                          return (
                            <div key={n} className="flex items-center justify-between">
                              <span className="text-sm text-emerald-100 capitalize">{n}</span>
                              <span className={`font-bold text-sm ${isDeficit ? 'text-red-300' : 'text-green-300'}`}>
                                {isDeficit ? `${val} kg` : `+${val} kg`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fertilizer Split */}
                  {result.fertilizer_split && (
                    <div className="rounded-2xl bg-white/10 border border-white/20 p-5 backdrop-blur-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-3">Suggested Fertilizer Split</p>
                      <ul className="space-y-2 text-sm">
                        {result.fertilizer_split.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-lime-300 mt-1">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => { setResult(null); setError(null); }}
                    className="w-full rounded-xl bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    Calculate Again
                  </button>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">How it works</p>
                  <h3 className="mt-3 text-xl font-extrabold leading-tight">Calculate crop-specific NPK needs.</h3>
                  <ul className="mt-4 space-y-2 text-sm text-emerald-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-lime-300 shrink-0" /> Compares with soil test values
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-lime-300 shrink-0" /> Based on ICAR crop standards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-lime-300 shrink-0" /> Gives exact fertilizer split
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NPKCalculator;

