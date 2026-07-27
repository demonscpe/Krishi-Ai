import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MushroomEdibility() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/mushroom/predict`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Prediction failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 sm:pt-24 font-sans">
      <section className="bg-gradient-to-r from-emerald-800 to-green-700 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Mushroom Edibility Checker</h1>
          <p className="mt-3 text-emerald-100">Upload a mushroom image to check if it's edible or poisonous.</p>
        </div>
      </section>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-emerald-50 hover:border-emerald-400 transition-all">
                <Upload size={40} className="text-gray-400 mb-3" />
                <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> mushroom image</p>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={preview} alt="Mushroom" className="w-full h-56 object-cover" />
                <button type="button" onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                  className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow hover:bg-white">
                  <Upload size={16} />
                </button>
              </div>
            )}

            {file && (
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 text-white font-bold hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50">
                {loading ? <><Loader2 className="inline animate-spin mr-2" size={18} />Analyzing...</> : 'Check Edibility'}
              </button>
            )}
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className={`mt-6 p-6 rounded-2xl border ${result.edible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                {result.edible ? <CheckCircle size={28} className="text-green-600" /> : <AlertCircle size={28} className="text-red-600" />}
                <h3 className={`text-xl font-bold ${result.edible ? 'text-green-800' : 'text-red-800'}`}>
                  {result.edible ? 'Edible' : 'Poisonous'}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{result.description || `Confidence: ${(result.confidence * 100).toFixed(1)}%`}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">{'\u26A0\uFE0F'} This tool provides an AI-based estimate only. Always consult an expert before consuming wild mushrooms.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
