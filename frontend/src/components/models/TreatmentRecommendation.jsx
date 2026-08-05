import React, { useState, useContext } from 'react';
import { Pill, FlaskConical, Leaf, Calendar, X, AlertTriangle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { DiseaseContext } from '../../context/DiseaseContext';

const CROPS = ['Tomato', 'Potato', 'Rice', 'Cotton', 'Maize', 'Wheat', 'Mango', 'Banana', 'Apple', 'Grapes', 'Chilli', 'Brinjal'];
const DISEASES = ['Early Blight', 'Late Blight', 'Powdery Mildew', 'Leaf Mold', 'Mosaic Virus', 'Bacterial Blight', 'Brown Spot', 'Leaf Blast', 'Curl Virus', 'Healthy'];

export default function TreatmentRecommendation() {
  const { plant, disease, setDisease } = useContext(DiseaseContext);
  const [selectedPlant, setSelectedPlant] = useState(plant || '');
  const [selectedDisease, setSelectedDisease] = useState(disease || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!selectedPlant || !selectedDisease) {
      setError('Please select both plant and disease.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/treatment-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant: selectedPlant, disease: selectedDisease }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      setResult(data);
      setDisease(selectedDisease);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl flex flex-wrap items-center gap-2 sm:gap-3 leading-tight">
            <Pill className="text-lime-300" /> Treatment Recommendation
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">
            Get chemical and organic treatment plans for any crop disease.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 p-6 sm:p-8">
          {plant && disease && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
              From diagnosis: <strong>{plant}</strong> — <strong>{disease}</strong>
            </div>
          )}

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
            {isLoading ? 'Finding treatments...' : 'Get Treatment Plan'} {!isLoading && <ArrowRight size={18} />}
          </button>

          {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-5">
                <div className="flex items-center gap-2 mb-2"><FlaskConical size={18} className="text-blue-600" /><span className="font-bold text-blue-800">Chemical Treatment</span></div>
                <p className="text-sm text-slate-700">{result.chemical_treatment}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-5">
                <div className="flex items-center gap-2 mb-2"><Leaf size={18} className="text-green-600" /><span className="font-bold text-green-800">Organic Method</span></div>
                <p className="text-sm text-slate-700">{result.organic_method}</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1"><Calendar size={14} /> Spray Frequency</div>
                  <p className="font-bold text-slate-800">{result.spray_frequency}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Remove Infected Leaves</p>
                  <p className={`font-bold ${result.remove_infected_leaves === 'Yes' ? 'text-red-600' : 'text-green-600'}`}>{result.remove_infected_leaves}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Estimated Recovery</p>
                  <p className="font-bold text-slate-800">{result.estimated_recovery_days} days</p>
                </div>
              </div>
              {result.dosage && <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm"><AlertTriangle size={14} className="inline mr-1 text-amber-600" /><strong>Dosage:</strong> {result.dosage}</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

