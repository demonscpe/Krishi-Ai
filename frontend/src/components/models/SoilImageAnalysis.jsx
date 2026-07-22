import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Image, Loader2, ArrowLeft, Sparkles, CheckCircle2, Leaf, ArrowRight } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const SoilImageAnalysis = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB.');
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/soil-image-analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze soil image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  // Result display items
  const analysisFields = result ? [
    { label: 'Soil Type', value: result.soil_type, key: 'soil_type' },
    { label: 'Soil Color', value: result.color, key: 'color' },
    { label: 'Texture', value: result.texture, key: 'texture' },
    { label: 'Surface Condition', value: result.condition, key: 'condition' },
  ] : [];

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
              <Sparkles size={14} className="text-lime-300" /> AI vision analysis
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Soil Image Analysis
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Upload a photo of your soil to instantly identify its type, color, texture, and surface condition.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left: Upload & Preview */}
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Camera size={22} /></div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600">Image upload</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Upload soil photograph</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">Clear, well-lit photos yield the best results.</p>
              </div>
            </div>

            {/* Drop zone */}
            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 transition-all hover:border-blue-400 hover:bg-blue-50/30"
              >
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-100">
                  <Upload className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-base font-bold text-slate-700">Click to upload or drag & drop</p>
                <p className="mt-1 text-sm text-slate-400">PNG, JPG, JPEG up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img src={preview} alt="Soil preview" className="w-full h-72 object-cover" />
                  <button
                    onClick={resetAnalysis}
                    className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    Change image
                  </button>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Analyzing soil image...
                    </>
                  ) : (
                    <>
                      <Image size={18} /> Analyze Soil
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}
          </section>

          {/* Right: Results */}
          <aside className="relative overflow-hidden bg-blue-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-800/35 to-blue-950/85" />
            <img src={bgHero} className="absolute inset-0 h-full w-full object-cover opacity-20" alt="" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-50">
                <Leaf size={14} className="text-lime-300" /> Analysis results
              </div>

              {result ? (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-extrabold">Soil Profile Identified</h3>
                  {analysisFields.map((field) => (
                    <div key={field.key} className="rounded-xl bg-white/10 border border-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-200">{field.label}</p>
                      <p className="mt-1 text-xl font-extrabold">{field.value}</p>
                      {result.confidence != null && (
                        <p className="mt-1 text-xs text-blue-200">Confidence: {result.confidence}%</p>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={resetAnalysis}
                    className="mt-4 w-full rounded-xl bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    Analyze another image
                  </button>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">How it works</p>
                  <h3 className="mt-3 text-2xl font-extrabold leading-tight">Upload a soil photo for instant AI analysis.</h3>
                  <p className="mt-3 text-sm leading-relaxed text-blue-50/80">
                    Our CNN model (MobileNetV3) analyzes soil type, color, texture, and surface condition from your photo.
                  </p>
                  <div className="mt-6 space-y-2">
                    {['Soil type classification', 'Color analysis', 'Texture assessment', 'Condition evaluation'].map((step) => (
                      <div key={step} className="flex items-center gap-2 text-sm text-blue-100">
                        <CheckCircle2 size={14} className="text-lime-300 shrink-0" /> {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SoilImageAnalysis;

