'use client'

import React, { useState, useEffect } from 'react'
import jsPDF from "jspdf";
import { 
  Beaker, 
  Wind, 
  Droplets, 
  Thermometer, 
  Download, 
  Eye, 
  FileText, 
  Sprout,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export default function FertilizerPrediction() {
  const [loading, setLoading] = useState(true)
  const [showSpan, setShowSpan] = useState(false);
  const [formData, setFormData] = useState({
    Temparature: "", Humidity: "", Moisture: "",
    Soil_Type: "", Crop_Type: "", Nitrogen: "",
    Potassium: "", Phosphorous: "",
  })
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePredictClick = async (e) => {
    e.preventDefault();
    const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
    const url = `${base}/api/fertilizer/predict`;
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data.Prediction);
      setShowSpan(true);
    } catch (error) {
      setResult("Error: Could not reach prediction server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Fertilizer Analysis Report", 20, 20);
    doc.setFontSize(12);
    Object.entries(formData).forEach(([key, val], i) => {
      doc.text(`${key}: ${val}`, 20, 40 + (i * 10));
    });
    doc.text(`RECOMMENDED: ${result}`, 20, 130);
    doc.save("agrotech_report.pdf");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-green-700 font-bold animate-pulse">Analyzing Soil Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Fertilizer <span className="text-green-600">Optimizer</span>
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-2">
              <Sprout className="w-4 h-4" /> Current Cycle: Spring-Summer Growth
            </p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setShowReport(!showReport)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
                <Eye size={18} /> View Report
             </button>
             <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-100 transition-all">
                <Download size={18} /> Export PDF
             </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Analytical Dashboard (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Real-time Nutrient Progress */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: 'Nitrogen', key: 'Nitrogen', color: 'bg-green-500', text: 'text-green-600' },
                { label: 'Phosphorus', key: 'Phosphorous', color: 'bg-blue-500', text: 'text-blue-600' },
                { label: 'Potassium', key: 'Potassium', color: 'bg-orange-500', text: 'text-orange-600' }
              ].map((n) => (
                <div key={n.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className={`font-black uppercase tracking-widest text-xs mb-4 ${n.text}`}>{n.label}</h3>
                  <div className="text-3xl font-black text-slate-800 mb-2">{formData[n.key] || '0'} <span className="text-sm font-normal text-slate-400">mg/kg</span></div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${n.color}`} 
                      style={{ width: `${Math.min((formData[n.key] / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Stage Progress */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <TrendingUp className="text-green-500" /> Phenological Growth Stage
              </h2>
              <div className="relative flex justify-between items-center px-4">
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-0"></div>
                {['Germination', 'Seedling', 'Tillering', 'Heading', 'Ripening'].map((stage, i) => (
                  <div key={stage} className="relative z-10 flex flex-col items-center group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${i <= 2 ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                      {i <= 2 ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 bg-slate-200 rounded-full"></div>}
                    </div>
                    <span className={`text-xs font-bold mt-3 ${i === 2 ? 'text-green-600' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Prediction Result */}
            {(result || isLoading) && (
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 rounded-[2.5rem] text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <Beaker size={28} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">Recommendation Engine</h2>
                    <p className="text-2xl font-black">Optimization Plan</p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <p className="text-xl font-medium italic">Synthesizing data points...</p>
                  </div>
                ) : (
                  <div className="bg-white/10 border border-white/20 p-6 rounded-3xl mt-4">
                    <p className="text-green-100 text-sm mb-1 uppercase font-bold tracking-widest">Recommended Fertilizer</p>
                    <h3 className="text-4xl font-black">{result}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-green-50 opacity-90">
                      This selection is optimized for your current nitrogen levels and soil moisture. Apply during early morning hours for maximum absorption.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Input & Context (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Weather Context */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2">
                <Thermometer className="text-orange-400" size={20} />
                <span className="font-bold">{formData.Temparature || '--'}°C</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Wind className="text-blue-400" size={20} />
                <span className="font-bold">{formData.Humidity || '--'}%</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Droplets className="text-cyan-400" size={20} />
                <span className="font-bold">{formData.Moisture || '--'}%</span>
              </div>
            </div>

            {/* The Entry Form */}
            <form onSubmit={handlePredictClick} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wider">Field Entry</h3>
              
              <div className="space-y-5">
                {[
                  { label: 'Temparature', name: 'Temparature', placeholder: '1-50°C' },
                  { label: 'Humidity', name: 'Humidity', placeholder: '1-100%' },
                  { label: 'Moisture', name: 'Moisture', placeholder: '1-100%' }
                ].map((input) => (
                  <div key={input.name}>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">{input.label}</label>
                    <input
                      type="number"
                      name={input.name}
                      value={formData[input.name]}
                      onChange={handleChange}
                      placeholder={input.placeholder}
                      className="w-full mt-1 px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Soil</label>
                    <select name="Soil_Type" value={formData.Soil_Type} onChange={handleChange} className="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none">
                      <option value="">Type</option>
                      <option value="0">Black</option><option value="1">Clayey</option><option value="4">Sandy</option>
                    </select>
                   </div>
                   <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Crop</label>
                    <select name="Crop_Type" value={formData.Crop_Type} onChange={handleChange} className="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none">
                      <option value="">Crop</option>
                      <option value="10">Wheat</option><option value="3">Maize</option><option value="6">Paddy</option>
                    </select>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                   {['Nitrogen', 'Phosphorous', 'Potassium'].map(k => (
                     <div key={k}>
                       <label className="text-[10px] font-bold text-slate-400 uppercase">{k[0]}</label>
                       <input type="number" name={k} value={formData[k]} onChange={handleChange} className="w-full mt-1 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-green-100" placeholder="Val" />
                     </div>
                   ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black tracking-widest transition-all active:scale-[0.98] disabled:bg-slate-300"
                >
                  {isLoading ? 'PROCESSING...' : 'RUN PREDICTION'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Conditional Report Detail View */}
        {showReport && (
          <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="text-green-600" /> Complete Analysis Report
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {Object.entries(formData).map(([k, v]) => (
                <div key={k} className="border-b border-slate-50 pb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">{k}</p>
                  <p className="text-lg font-bold text-slate-700">{v || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}