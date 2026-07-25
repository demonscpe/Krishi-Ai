import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Leaf, Droplets, Beaker, ArrowLeft, Sparkles, Loader2, AlertCircle, CheckCircle2, Sun, TestTube } from 'lucide-react';

const CROPS = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion',
  'Groundnut', 'Soybean', 'Sunflower', 'Mustard', 'Chilli', 'Brinjal', 'Cabbage'
];

const CROP_NPK_REQUIREMENTS = {
  'Rice': { N: 120, P: 60, K: 60 },
  'Wheat': { N: 140, P: 70, K: 70 },
  'Maize': { N: 150, P: 75, K: 75 },
  'Cotton': { N: 120, P: 60, K: 60 },
  'Sugarcane': { N: 200, P: 100, K: 100 },
  'Tomato': { N: 100, P: 50, K: 50 },
  'Potato': { N: 130, P: 65, K: 65 },
  'Onion': { N: 90, P: 45, K: 45 },
  'Groundnut': { N: 40, P: 80, K: 80 },
  'Soybean': { N: 30, P: 90, K: 90 },
  'Sunflower': { N: 80, P: 40, K: 40 },
  'Mustard': { N: 100, P: 50, K: 50 },
  'Chilli': { N: 110, P: 55, K: 55 },
  'Brinjal': { N: 100, P: 50, K: 50 },
  'Cabbage': { N: 120, P: 60, K: 60 },
};

const NPKCalculator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    crop: '', area: '', area_unit: 'acre',
    nitrogen: '', phosphorus: '', potassium: '', target_yield: '',
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('soilTestValues');
      if (saved) {
        const data = JSON.parse(saved);
        setForm(prev => ({ ...prev, nitrogen: data.nitrogen || '', phosphorus: data.phosphorus || '', potassium: data.potassium || '' }));
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
      const res = await fetch(`${base}/api/tools/npk-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop, area: parseFloat(form.area), area_unit: form.area_unit,
          current_npk: { nitrogen: form.nitrogen ? parseFloat(form.nitrogen) : null, phosphorus: form.phosphorus ? parseFloat(form.phosphorus) : null, potassium: form.potassium ? parseFloat(form.potassium) : null },
          target_yield: form.target_yield ? parseFloat(form.target_yield) : null,
        }),
      });
      if (!res.ok) throw new Error('USE_DEMO');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      const area = parseFloat(form.area) || 1;
      const areaHa = form.area_unit === 'acre' ? area * 0.404686 : area;
      const req = CROP_NPK_REQUIREMENTS[form.crop] || { N: 100, P: 50, K: 50 };
      const currentN = form.nitrogen ? parseFloat(form.nitrogen) : 0;
      const currentP = form.phosphorus ? parseFloat(form.phosphorus) : 0;
      const currentK = form.potassium ? parseFloat(form.potassium) : 0;
      
      setTimeout(() => {
        setResult({
          required_npk: { nitrogen: Math.round(req.N * areaHa), phosphorus: Math.round(req.P * areaHa), potassium: Math.round(req.K * areaHa) },
          deficit: {
            nitrogen: Math.round(req.N * areaHa) - currentN,
            phosphorus: Math.round(req.P * areaHa) - currentP,
            potassium: Math.round(req.K * areaHa) - currentK,
          },
          fertilizer_split: [
            `Apply ${Math.max(0, Math.round((Math.round(req.N * areaHa) - currentN) * 0.5))} kg N as basal dose`,
            `Apply ${Math.max(0, Math.round((Math.round(req.N * areaHa) - currentN) * 0.3))} kg N at tillering stage`,
            `Apply ${Math.max(0, Math.round((Math.round(req.N * areaHa) - currentN) * 0.2))} kg N at flowering stage`,
            `Apply ${Math.max(0, Math.round(req.P * areaHa) - currentP)} kg P₂O₅ as basal dose`,
            `Apply ${Math.max(0, Math.round(req.K * areaHa) - currentK)} kg K₂O in two splits`,
          ].filter(s => !s.startsWith('Apply 0 kg')),
        });
        setIsLoading(false);
      }, 800);
      return;
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 pt-20 font-sans">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm hover:bg-white/20 transition-all">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 border border-emerald-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
            <Sparkles size={14} /> Nutrient Calculator
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">NPK Fertilizer Calculator</h1>
          <p className="mt-3 text-emerald-200/70 max-w-xl mx-auto">Calculate exact N-P-K requirements based on your crop and soil test results</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-emerald-400 text-emerald-900' : 'bg-white/10 text-white/40'}`}>{s}</div>
              <span className={`text-xs font-medium ${step >= s ? 'text-emerald-300' : 'text-white/30'}`}>
                {s === 1 ? 'Crop & Area' : s === 2 ? 'Soil NPK' : 'Results'}
              </span>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-400' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20">
                    <Sun className="text-emerald-400" size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Crop & Field Details</h2>
                    <p className="text-sm text-white/50">Step 1 of 2</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Select Crop</label>
                  <select name="crop" value={form.crop} onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 appearance-none cursor-pointer">
                    <option value="" className="bg-slate-800">Choose your crop...</option>
                    {CROPS.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Field Area</label>
                    <input type="number" name="area" value={form.area} onChange={handleChange} min="0" step="0.1"
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 placeholder:text-white/30"
                      placeholder="e.g. 2.5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Unit</label>
                    <select name="area_unit" value={form.area_unit} onChange={handleChange}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 appearance-none cursor-pointer">
                      <option value="acre" className="bg-slate-800">Acres</option>
                      <option value="hectare" className="bg-slate-800">Hectares</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!form.crop || !form.area}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Next — Soil Nutrients →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20">
                    <TestTube className="text-blue-400" size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Soil Nutrient Levels</h2>
                    <p className="text-sm text-white/50">Step 2 of 2</p>
                  </div>
                </div>
                <p className="text-sm text-white/60">Enter current soil NPK values from your soil test report (optional).</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'nitrogen', label: 'Nitrogen (N)', icon: Beaker, color: 'text-blue-400', border: 'focus:border-blue-400 focus:ring-blue-400/30' },
                    { key: 'phosphorus', label: 'Phosphorus (P)', icon: Droplets, color: 'text-red-400', border: 'focus:border-red-400 focus:ring-red-400/30' },
                    { key: 'potassium', label: 'Potassium (K)', icon: Leaf, color: 'text-amber-400', border: 'focus:border-amber-400 focus:ring-amber-400/30' },
                  ].map(({ key, label, icon: Icon, color, border }) => (
                    <div key={key}>
                      <label className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${color} mb-2`}><Icon size={14} /> {label}</label>
                      <input type="number" name={key} value={form[key]} onChange={handleChange}
                        className={`w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none ${border} placeholder:text-white/30`}
                        placeholder="0" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Target Yield (optional)</label>
                  <input type="number" name="target_yield" value={form.target_yield} onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 placeholder:text-white/30"
                    placeholder="e.g. 5 tons/hectare" />
                </div>
                {error && (<div className="p-4 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}</div>)}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 rounded-xl bg-white/10 px-5 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all">← Back</button>
                  <button onClick={handleCalculate} disabled={isLoading}
                    className="flex-[2] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-40">
                    {isLoading ? <><Loader2 size={18} className="animate-spin inline mr-2" /> Calculating...</> : <><Calculator size={18} className="inline mr-2" /> Calculate NPK</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-800 border border-white/10 p-6 sm:p-8">
            {result ? (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300">Calculation Complete</span>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Required Nutrients for {form.crop}</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { label: 'Nitrogen (N)', value: result.required_npk?.nitrogen, color: 'text-blue-400' },
                      { label: 'Phosphorus (P)', value: result.required_npk?.phosphorus, color: 'text-red-400' },
                      { label: 'Potassium (K)', value: result.required_npk?.potassium, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-3 rounded-lg bg-white/5">
                        <p className={`text-3xl font-black ${color}`}>{value || 0}</p>
                        <p className="text-xs text-white/50 mt-1">kg</p>
                        <p className="text-[10px] text-white/40">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {result.deficit && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Deficit / Surplus</h3>
                    <div className="space-y-2">
                      {[
                        { key: 'nitrogen', label: 'Nitrogen', color: 'text-blue-400' },
                        { key: 'phosphorus', label: 'Phosphorus', color: 'text-red-400' },
                        { key: 'potassium', label: 'Potassium', color: 'text-amber-400' },
                      ].map(({ key, label, color }) => {
                        const val = result.deficit[key];
                        return (
                          <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                            <span className="text-sm text-white/70">{label}</span>
                            <span className={`font-bold text-sm ${val < 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {val < 0 ? `${val} kg` : `+${val} kg`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {result.fertilizer_split?.length > 0 && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Fertilizer Application Plan</h3>
                    <div className="space-y-2">
                      {result.fertilizer_split.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                          <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">{i + 1}</div>
                          <span className="text-sm text-white/70">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => { setResult(null); setStep(1); setError(null); }}
                  className="w-full rounded-xl bg-white/10 px-5 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all">
                  Calculate Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 mb-6">
                  <Calculator size={48} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Results Yet</h3>
                <p className="text-sm text-white/50 max-w-xs">Fill in your crop details and soil nutrient values on the left, then calculate your NPK requirements.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPKCalculator;

