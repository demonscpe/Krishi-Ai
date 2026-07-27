import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Loader2, ArrowLeft, Sparkles, CheckCircle2, 
  Leaf, PenLine, AlertCircle, Download
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const SOIL_FIELDS = [
  { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'kg/ha', min: 0, max: 500, step: '0.1', placeholder: 'e.g. 120' },
  { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'kg/ha', min: 0, max: 300, step: '0.1', placeholder: 'e.g. 45' },
  { key: 'potassium', label: 'Potassium (K)', unit: 'kg/ha', min: 0, max: 500, step: '0.1', placeholder: 'e.g. 35' },
  { key: 'ph', label: 'pH Level', unit: 'pH', min: 0, max: 14, step: '0.01', placeholder: 'e.g. 6.5' },
  { key: 'organic_carbon', label: 'Organic Carbon', unit: '%', min: 0, max: 10, step: '0.01', placeholder: 'e.g. 0.8' },
  { key: 'ec', label: 'Electrical Conductivity', unit: 'dS/m', min: 0, max: 10, step: '0.01', placeholder: 'e.g. 0.5' },
];

const SoilTestInput = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({
    nitrogen: '', phosphorus: '', potassium: '',
    ph: '', organic_carbon: '', ec: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ocrResults, setOcrResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const validate = () => {
    for (const field of SOIL_FIELDS) {
      const val = parseFloat(formData[field.key]);
      if (isNaN(val)) {
        setError(`Please enter a valid value for ${field.label}`);
        return false;
      }
      if (val < field.min || val > field.max) {
        setError(`${field.label} must be between ${field.min} and ${field.max}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const payload = {
        ...Object.fromEntries(
          SOIL_FIELDS.map(f => [f.key, parseFloat(formData[f.key])])
        ),
      };

      const res = await fetch(`${base}/api/soil-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      setSuccess('Soil test values saved successfully! You can now proceed to Health Analyzer.');
      setOcrResults(null);
    } catch (err) {
      setError(err.message || 'Failed to save soil test data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setIsOcrLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/soil-test/ocr`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `OCR failed (${res.status})`);
      }

      const data = await res.json();
      setOcrResults(data);

      // Auto-fill form with OCR results
      const filled = { ...formData };
      SOIL_FIELDS.forEach(f => {
        const ocrKey = f.key;
        if (data[ocrKey] != null && data[ocrKey] !== '') {
          filled[ocrKey] = String(data[ocrKey]);
        }
      });
      setFormData(filled);
      setActiveTab('manual');
      setSuccess('OCR completed! Please review and edit the auto-filled values before submitting.');
    } catch (err) {
      setError(err.message || 'Failed to process PDF. Please enter values manually.');
    } finally {
      setIsOcrLoading(false);
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
              <Sparkles size={14} className="text-lime-300" /> Soil data entry
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Soil Test Input
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Enter soil test values manually or upload a lab report PDF for automatic extraction.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left: Form */}
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600"><PenLine size={22} /></div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-purple-600">Data entry</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Enter soil test values</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">Enter values from your latest soil lab report.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <PenLine size={15} className="inline mr-1.5" /> Manual Entry
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload size={15} className="inline mr-1.5" /> Upload Report
              </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="mb-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 transition-all hover:border-purple-400 hover:bg-purple-50/30"
                >
                  {isOcrLoading ? (
                    <>
                      <Loader2 size={32} className="animate-spin text-purple-600 mb-3" />
                      <p className="text-sm font-bold text-slate-700">Extracting values from PDF...</p>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-purple-100">
                        <Download className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-base font-bold text-slate-700">Upload lab report PDF</p>
                      <p className="mt-1 text-sm text-slate-400">Values will be auto-extracted via OCR</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </div>

                {ocrResults && (
                  <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">OCR Results</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {SOIL_FIELDS.map(f => (
                        <div key={f.key} className="flex justify-between">
                          <span className="text-green-600">{f.label}:</span>
                          <span className="font-bold text-green-800">{ocrResults[f.key] ?? 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {SOIL_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor={field.key} className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">{field.label}</label>
                      <span className="text-xs font-medium text-slate-400">{field.unit}</span>
                    </div>
                    <input
                      id={field.key}
                      type="number"
                      step={field.step}
                      inputMode="decimal"
                      name={field.key}
                      value={formData[field.key]}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-purple-700/20 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Save Soil Test Values
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Messages */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {success}
              </div>
            )}
          </section>

          {/* Right sidebar */}
          <aside className="relative overflow-hidden bg-purple-900 p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-800/35 to-purple-950/85" />
            <img src={bgHero} className="absolute inset-0 h-full w-full object-cover opacity-20" alt="" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-purple-50">
                <Leaf size={14} className="text-lime-300" /> Data sources
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-extrabold">Why accurate soil data matters</h3>
                <p className="text-sm leading-relaxed text-purple-50/80">
                  Precise soil test values are the foundation of all our AI-powered recommendations. 
                  Upload your lab report and we'll extract the values automatically.
                </p>
                <div className="space-y-2">
                  {['Manual entry with validation', 'PDF OCR auto-extraction', 'Review before saving', 'Used by all downstream modules'].map((step) => (
                    <div key={step} className="flex items-center gap-2 text-sm text-purple-100">
                      <CheckCircle2 size={14} className="text-lime-300 shrink-0" /> {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-6">
                <button
                  onClick={() => navigate('/soil/health-analyzer')}
                  className="w-full rounded-xl bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  Proceed to Health Analyzer →
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SoilTestInput;

