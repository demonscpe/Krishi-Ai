import React, { useState, useContext } from 'react';
import { Activity, Upload, X, ArrowRight, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { DiseaseContext } from '../../context/DiseaseContext';

export default function DiseaseSeverity() {
  const { disease, plant } = useContext(DiseaseContext);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!image) { setError('Please upload an image of the affected area.'); return; }
    setIsLoading(true);
    setError(null);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('image', image);
      if (disease) formData.append('disease', disease);
      if (plant) formData.append('plant', plant);

      const res = await fetch(`${base}/api/disease-severity`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analysis failed');

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const severityColor = (s) => {
    if (s === 'Low') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (s === 'High') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700';
  };

  const riskColor = (r) => {
    if (r === 'Low') return 'text-green-600';
    if (r === 'Medium') return 'text-yellow-600';
    if (r === 'High') return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl flex items-center gap-3">
            <Activity className="text-lime-300" /> Severity Assessment
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">
            Analyze how severely a plant is affected by disease.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          <section className="p-5 sm:p-8 lg:p-10">
            {disease && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                Detected disease: <strong>{disease}</strong> on <strong>{plant || 'unknown plant'}</strong>
              </div>
            )}
            <div
              onClick={() => document.getElementById('severity-img-input')?.click()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => e.preventDefault()}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-emerald-400"
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain" />
                  <button onClick={() => { setImage(null); setPreview(null); }} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white"><X size={12} /></button>
                </div>
              ) : (
                <><div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Upload size={22} /></div>
                  <p className="font-bold text-slate-700">Upload leaf image for severity analysis</p></>
              )}
              <input id="severity-img-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            </div>
            <button onClick={handleAnalyze} disabled={isLoading || !image}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-60">
              {isLoading ? 'Analyzing severity...' : 'Assess Severity'} {!isLoading && <ArrowRight size={18} />}
            </button>
            {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}
          </section>

          <aside className="relative overflow-hidden bg-emerald-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/35 to-emerald-950/85" />
            <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800" className="absolute inset-0 h-full w-full object-cover opacity-30" alt="" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50">
                <Activity size={14} className="text-lime-300" /> Severity
              </div>
              {result ? (
                <div className="mt-6 space-y-4">
                  <div className={`rounded-2xl border p-5 ${severityColor(result.severity)}`}>
                    <h3 className="text-xl font-extrabold">{result.severity}</h3>
                    <p className="text-sm mt-1">Severity Level</p>
                  </div>
                  {result.affected_area_percent != null && (
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Affected Area</p>
                      <p className="text-3xl font-extrabold mt-1">{result.affected_area_percent}%</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full rounded-full bg-orange-400 transition-all duration-1000" style={{ width: `${result.affected_area_percent}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className={riskColor(result.risk_level)} />
                    <span className="font-bold">Risk Level: {result.risk_level}</span>
                  </div>
                  {result.annotated_image_base64 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">Annotated Image</p>
                      <img src={`data:image/png;base64,${result.annotated_image_base64}`} alt="Annotated" className="rounded-xl border border-white/20" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">Severity Analysis</p>
                  <h3 className="mt-3 text-xl font-extrabold">Upload a leaf image to assess severity.</h3></div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

