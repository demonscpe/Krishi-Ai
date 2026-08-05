import React, { useState, useContext } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Droplets, RefreshCw, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { DiseaseContext } from '../../context/DiseaseContext';

const CROPS = ['Tomato', 'Potato', 'Rice', 'Cotton', 'Maize', 'Wheat', 'Mango', 'Banana', 'Apple', 'Grapes', 'Chilli', 'Brinjal'];
const DISEASES = ['Early Blight', 'Late Blight', 'Powdery Mildew', 'Leaf Mold', 'Mosaic Virus', 'Bacterial Blight', 'Brown Spot', 'Leaf Blast', 'Curl Virus', 'Healthy'];

export default function DiseasePrevention() {
  const { plant, disease } = useContext(DiseaseContext);
  const [selectedPlant, setSelectedPlant] = useState(plant || '');
  const [selectedDisease, setSelectedDisease] = useState(disease || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!selectedPlant || !selectedDisease) { setError('Please select both plant and disease.'); return; }
    setIsLoading(true); setError(null);
    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/disease-prevention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant: selectedPlant, disease: selectedDisease }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl flex flex-wrap items-center gap-2 sm:gap-3 leading-tight"><Shield className="text-lime-300 shrink-0" /> Prevention Guide</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">Learn how to prevent diseases and protect your crops.</p>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 p-6 sm:p-8">
          {plant && disease && (<div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">From diagnosis: <strong>{plant}</strong> — <strong>{disease}</strong></div>)}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">Plant / Crop</label>
              <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="">Select plant...</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">Disease</label>
              <select value={selectedDisease} onChange={(e) => setSelectedDisease(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="">Select disease...</option>
                {DISEASES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isLoading || !selectedPlant || !selectedDisease}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-60">
            {isLoading ? 'Loading guide...' : 'Get Prevention Guide'} {!isLoading && <ArrowRight size={18} />}
          </button>
          {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

          {result && (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
                <div className="flex items-center gap-2 mb-3"><AlertTriangle size={18} className="text-red-600" /><span className="font-bold text-red-800">Possible Causes</span></div>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">{result.causes?.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
              <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
                <div className="flex items-center gap-2 mb-3"><CheckCircle2 size={18} className="text-green-600" /><span className="font-bold text-green-800">Recommended Prevention Steps</span></div>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">{result.prevention_steps?.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {result.seasonal_precautions?.length > 0 && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2"><Calendar size={14} /> Seasonal Precautions</div>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">{result.seasonal_precautions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                {result.crop_rotation_advice && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2"><RefreshCw size={14} /> Crop Rotation</div>
                    <p className="text-xs text-slate-700">{result.crop_rotation_advice}</p>
                  </div>
                )}
                {result.irrigation_recommendations && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2"><Droplets size={14} /> Irrigation</div>
                    <p className="text-xs text-slate-700">{result.irrigation_recommendations}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

