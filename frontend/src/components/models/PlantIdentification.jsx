import React, { useState, useRef, useContext } from 'react';
import {
  Upload, X, Search, ArrowRight, CheckCircle2, Sparkles,
  Leaf, AlertTriangle, Bug, Shield, Dna, FlaskConical, Sprout, Camera
} from 'lucide-react';
import { DiseaseContext } from '../../context/DiseaseContext';

const API_BASE = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';

export default function PlantIdentification() {
  const { setPlant, setDisease } = useContext(DiseaseContext);
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
    setImages(prev => [...prev, ...validFiles].slice(0, 1));
    const reader = new FileReader();
    reader.onload = (e) => setPreviews([e.target.result]);
    reader.readAsDataURL(validFiles[0]);
    setError(null);
  };

  const removeImage = () => {
    setImages([]);
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handlePredict = async () => {
    if (images.length === 0) {
      setError('Please upload a plant image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('images', images[0]);

      const res = await fetch(`${API_BASE}/api/plant-identification`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Prediction failed');

      setResult(data);
      setPlant(data.plant);
      if (data.disease) setDisease(data.disease);
    } catch (err) {
      setError(err.message || 'Could not reach the identification service.');
    } finally {
      setIsLoading(false);
    }
  };

  const isHealthy = result?.health_status === 'Healthy';

  const renderConfidence = (value) => {
    if (value == null) return null;
    return (
      <div className="mt-3">
        <div className="flex items-center gap-2 text-sm text-emerald-100">
          <CheckCircle2 size={16} className="text-lime-300" />
          Confidence: {value.toFixed ? value.toFixed(1) : value}%
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-lime-400 transition-all duration-1000"
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1920')] bg-cover bg-center opacity-15" />
        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Module 1
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Plant Detection <span className="text-lime-300">&amp; Health</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80">
              Upload a leaf, fruit, or stem photo to identify the plant species, detect diseases, and get instant remedies.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-emerald-100">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Plant identification</span>
              <span className="flex items-center gap-2"><Bug size={16} className="text-lime-300" /> Disease detection</span>
              <span className="flex items-center gap-2"><FlaskConical size={16} className="text-lime-300" /> Remedy suggestions</span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          {/* Left Panel — Upload & Analyze */}
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <Leaf size={22} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Plant Analyzer</h2>
                <p className="text-sm text-slate-500 mt-0.5">Upload a clear photo of the plant (leaf, fruit, or stem)</p>
              </div>
            </div>

            {/* Drag/Drop Zone */}
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 sm:p-10 transition hover:border-emerald-400 hover:bg-emerald-50/30"
            >
              {previews.length > 0 ? (
                <div className="relative w-full max-w-sm">
                  <img src={previews[0]} alt="Plant preview" className="w-full max-h-64 rounded-xl object-contain" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Upload size={24} />
                  </div>
                  <p className="font-bold text-slate-700">Drag & drop image here</p>
                  <p className="mt-1 text-xs text-slate-400 inline-flex items-center gap-1">
                    <Camera size={12} /> or click to browse (JPEG, PNG, WEBP)
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handlePredict}
              disabled={isLoading || images.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing Plant & Detecting Disease...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Detect Plant & Disease
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}
          </section>

          {/* Right Panel — Results */}
          <aside className="relative overflow-hidden bg-emerald-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/35 to-emerald-950/85" />
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
              alt=""
              aria-hidden="true"
            />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50">
                <Search size={14} className="text-lime-300" /> Detection Results
              </div>

              {result ? (
                <div className="mt-6 space-y-4 overflow-y-auto max-h-[560px] pr-1">
                  {/* Plant identity */}
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-5 backdrop-blur-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                      <Sprout size={14} /> Identified Plant
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold">{result.plant}</h3>
                    {result.scientific_name && (
                      <p className="mt-1 text-sm italic text-emerald-100"><Dna size={13} className="inline mr-1" />{result.scientific_name}</p>
                    )}
                    {result.family && (
                      <p className="mt-1 text-xs text-emerald-200">Family: {result.family}</p>
                    )}
                    {renderConfidence(result.confidence)}
                    {result.description && (
                      <p className="mt-3 text-sm leading-relaxed text-emerald-50/90">{result.description}</p>
                    )}
                  </div>

                  {/* Health status */}
                  <div className={`rounded-2xl border p-5 backdrop-blur-sm ${
                    isHealthy
                      ? 'bg-green-500/20 border-green-300/30'
                      : result.health_status === 'Diseased'
                        ? 'bg-red-500/20 border-red-300/30'
                        : 'bg-amber-500/20 border-amber-300/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isHealthy ? (
                        <CheckCircle2 size={20} className="text-green-300" />
                      ) : result.health_status === 'Diseased' ? (
                        <AlertTriangle size={20} className="text-red-300" />
                      ) : (
                        <AlertTriangle size={20} className="text-amber-300" />
                      )}
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isHealthy ? 'text-green-200' : result.health_status === 'Diseased' ? 'text-red-200' : 'text-amber-200'
                      }`}>
                        {result.health_status || 'Unknown'}
                      </span>
                    </div>

                    {result.disease ? (
                      <>
                        <h4 className="text-xl font-extrabold flex items-center gap-2">
                          <Bug size={18} className="text-red-300" /> {result.disease}
                        </h4>
                        {renderConfidence(result.disease_confidence)}
                      </>
                    ) : isHealthy ? (
                      <p className="text-sm text-emerald-100">No disease detected. Plant appears healthy. 🎉</p>
                    ) : null}
                  </div>

                  {/* Symptoms */}
                  {result.symptoms && (
                    <div className="rounded-2xl bg-white/10 border border-white/20 p-5 backdrop-blur-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                        <Shield size={14} /> Symptoms
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">{result.symptoms}</p>
                    </div>
                  )}

                  {/* Remedy */}
                  {result.remedy && (
                    <div className="rounded-2xl bg-lime-500/10 border border-lime-300/30 p-5 backdrop-blur-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-lime-200 flex items-center gap-1.5">
                        <FlaskConical size={14} /> Recommended Remedy
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-emerald-50/95">{result.remedy}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">Upload & Detect</p>
                  <h3 className="mt-3 text-xl font-extrabold leading-tight">Identify any plant from a photo.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">
                    Results will show plant name, scientific name, health status, disease (if any), symptoms, and remedy.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

