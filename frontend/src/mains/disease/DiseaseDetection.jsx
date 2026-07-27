import React, { useState, useContext } from 'react';
import { Upload, Bug, X, ArrowRight, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DiseaseContext } from '../../context/DiseaseContext';

const CROPS = ['Tomato', 'Potato', 'Rice', 'Cotton', 'Maize', 'Wheat', 'Mango', 'Banana', 'Apple', 'Grapes', 'Chilli', 'Brinjal'];

export default function DiseaseDetection() {
  const { plant, setPlant, disease, setDisease } = useContext(DiseaseContext);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(plant || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handlePredict = async () => {
    if (!image) { setError('Please upload a plant image.'); return; }
    if (!selectedCrop) { setError('Please select or enter a plant type.'); return; }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('image', image);
      formData.append('plant', selectedCrop);

      const res = await fetch(`${base}/api/disease-detection`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Detection failed');

      setResult(data);
      setPlant(selectedCrop);
      setDisease(data.disease);
    } catch (err) {
      setError(err.message || 'Could not reach the detection service.');
    } finally {
      setIsLoading(false);
    }
  };

  const isHealthy = result?.status === 'Healthy';

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1920')] bg-cover bg-center opacity-15" />
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl flex items-center gap-3">
            <Bug className="text-lime-300" /> Disease Detection
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">
            Upload a plant image and select the crop type to detect diseases with AI.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Upload Plant Image</h2>
              <p className="text-sm text-slate-500 mt-1">Take a clear photo of the affected leaf, fruit, or stem.</p>
            </div>

            {plant && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                Using identified plant: <strong>{plant}</strong>
              </div>
            )}

            {/* Drop Zone */}
            <div
              onClick={() => document.getElementById('disease-img-input')?.click()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => e.preventDefault()}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-emerald-400 hover:bg-emerald-50/30"
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain" />
                  <button onClick={() => { setImage(null); setPreview(null); }} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Upload size={22} />
                  </div>
                  <p className="font-bold text-slate-700">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP</p>
                </>
              )}
              <input id="disease-img-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            </div>

            {/* Crop Select */}
            <div className="mt-4">
              <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">Plant Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">Select plant type...</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={isLoading || !image || !selectedCrop}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Analyzing...' : 'Detect Disease'}
              {!isLoading && <ArrowRight size={18} />}
            </button>

            {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}
          </section>

          {/* Results */}
          <aside className="relative overflow-hidden bg-emerald-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/35 to-emerald-950/85" />
            <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800" className="absolute inset-0 h-full w-full object-cover opacity-30" alt="" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50">
                <Bug size={14} className="text-lime-300" /> Diagnosis
              </div>

              {result ? (
                <div className="mt-6 space-y-4">
                  <div className={`rounded-2xl border p-5 backdrop-blur-sm ${isHealthy ? 'bg-green-500/20 border-green-300/30' : 'bg-red-500/20 border-red-300/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isHealthy ? <CheckCircle2 size={20} className="text-green-300" /> : <AlertTriangle size={20} className="text-red-300" />}
                      <span className={`text-xs font-bold uppercase tracking-wider ${isHealthy ? 'text-green-200' : 'text-red-200'}`}>{result.status}</span>
                    </div>
                    <h3 className="text-2xl font-extrabold">{result.disease}</h3>
                    {result.confidence != null && (
                      <p className="mt-2 text-sm text-emerald-100">Confidence: {result.confidence.toFixed(1)}%</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">Detect & Classify</p>
                  <h3 className="mt-3 text-xl font-extrabold leading-tight">Identify diseases early.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">Results will show disease name, confidence, and health status.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

