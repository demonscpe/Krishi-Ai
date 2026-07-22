import React, { useState, useRef, useContext } from 'react';
import { Upload, Image as ImageIcon, X, Search, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { DiseaseContext } from '../../context/DiseaseContext';

export default function PlantIdentification() {
  const { setPlant } = useContext(DiseaseContext);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please upload valid image files (JPEG, PNG, etc.)');
      return;
    }
    setImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
    setError(null);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handlePredict = async () => {
    if (images.length === 0) {
      setError('Please upload at least one plant image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const formData = new FormData();
      images.forEach(img => formData.append('images', img));

      const res = await fetch(`${base}/api/plant-identification`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Prediction failed');

      setResult(data);
      setPlant(data.plant);
    } catch (err) {
      setError(err.message || 'Could not reach the identification service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1920')] bg-cover bg-center opacity-15" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Module 1
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Plant Identification</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">
              Upload leaf, fruit, or stem photos to identify plant species using AI.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Upload Plant Photos</h2>
              <p className="text-sm text-slate-500 mt-1">Upload leaf, fruit, or stem images (you can select multiple).</p>
            </div>

            {/* Drag/Drop Zone */}
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 transition hover:border-emerald-400 hover:bg-emerald-50/30"
            >
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <Upload size={24} />
              </div>
              <p className="font-bold text-slate-700">Drag & drop images here</p>
              <p className="mt-1 text-xs text-slate-400">or click to browse (JPEG, PNG, WEBP)</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </div>

            {/* Preview Thumbnails */}
            {previews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200">
                    <img src={src} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <span className="self-center text-xs text-slate-400">{images.length} file(s)</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handlePredict}
              disabled={isLoading || images.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Identifying...' : 'Identify Plant'}
              {!isLoading && <ArrowRight size={18} />}
            </button>

            {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}
          </section>

          {/* Results Sidebar */}
          <aside className="relative overflow-hidden bg-emerald-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/35 to-emerald-950/85" />
            <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800" className="absolute inset-0 h-full w-full object-cover opacity-30" alt="" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50">
                <Search size={14} className="text-lime-300" /> Results
              </div>

              {result ? (
                <div className="mt-6">
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-6 backdrop-blur-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Identified Plant</p>
                    <h3 className="mt-2 text-3xl font-extrabold">{result.plant}</h3>
                    {result.confidence != null && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-sm text-emerald-100">
                          <CheckCircle2 size={16} className="text-lime-300" />
                          Confidence: {result.confidence.toFixed(1)}%
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full rounded-full bg-lime-400 transition-all duration-1000" style={{ width: `${result.confidence}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">Upload & Identify</p>
                  <h3 className="mt-3 text-xl font-extrabold leading-tight">Identify any plant from a photo.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">Results will appear here with plant name and confidence score.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

