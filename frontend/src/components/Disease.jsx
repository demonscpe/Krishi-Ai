'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Leaf, Zap, ShieldCheck } from 'lucide-react'
import allcrops from '../assets/crops/allcrops.png'

const CROP_IMAGES = {
  Sugarcane: "https://images.unsplash.com/photo-1590757395073-772986423023?auto=format&fit=crop&q=80&w=1200",
  Paddy: "https://images.unsplash.com/photo-1536633100184-4869c978051a?auto=format&fit=crop&q=80&w=1200",
  Default: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200"
};

const fruits = [
  { name: "Apple", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800", diseases: ["Apple Scab", "Fire Blight", "Powdery Mildew"] },
  { name: "Blueberry", image: "https://images.unsplash.com/photo-1497534446932-c946e7316ad1?auto=format&fit=crop&q=80&w=800", diseases: ["Mummy Berry", "Botrytis Blight"] },
  { name: "Cherry", image: "https://images.unsplash.com/photo-1528825831115-b581a1ef9867?auto=format&fit=crop&q=80&w=800", diseases: ["Cherry Leaf Spot", "Brown Rot"] },
  { name: "Corn", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800", diseases: ["Common Rust", "Gray Leaf Spot"] },
  { name: "Grape", image: "https://images.unsplash.com/photo-1533604195573-a38291328a42?auto=format&fit=crop&q=80&w=800", diseases: ["Powdery Mildew", "Black Rot"] },
  { name: "Orange", image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800", diseases: ["Citrus Canker", "Greasy Spot"] },
  { name: "Peach", image: "https://images.unsplash.com/photo-1629911723984-4811824d7942?auto=format&fit=crop&q=80&w=800", diseases: ["Peach Leaf Curl", "Bacterial Spot"] },
  { name: "Potato", image: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=800", diseases: ["Late Blight", "Early Blight"] },
  { name: "Tomato", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800", diseases: ["Early Blight", "Late Blight"] },
];

export default function PlantDiseaseDetection() {
  const [showCropList, setShowCropList] = useState(false)

  const handleImgError = (e) => {
    e.target.src = CROP_IMAGES.Default;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-emerald-100 pt-20" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative pt-16 pb-12 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-10 w-64 h-64 bg-emerald-400 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="inline-block py-1 px-3 mb-4 text-[10px] font-bold tracking-[0.15em] text-emerald-700 uppercase bg-emerald-100 rounded-full">
            AI-Powered Agriculture
          </span>
          {/* FONT SIZE REDUCED TO 36PX HERE */}
          <h1 className="text-[40px] font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            Plant Disease <span className="text-emerald-600">Detection</span>
          </h1>
          <p className="text-[13px] md:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto font-medium">
            Identify crop pathologies with specialized neural networks. Select an engine to begin your scan.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-20">
        
        {/* Specialized Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-emerald-500 w-4 h-4 fill-emerald-500" />
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Specialized Engines</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Sugarcane', 'Paddy'].map((crop) => (
              <motion.div 
                key={crop}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all duration-300"
              >
                <div className="h-52 overflow-hidden relative bg-slate-200">
                  <img 
                    src={CROP_IMAGES[crop]} 
                    alt={crop}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={handleImgError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <h3 className="text-lg font-bold text-white leading-tight">{crop} Engine</h3>
                    <p className="text-emerald-200 text-[9px] font-semibold uppercase tracking-wider">High-Precision Model</p>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center bg-white">
                  <div className="flex gap-2 items-center">
                    <ShieldCheck className="text-emerald-500 w-3.5 h-3.5" />
                    <span className="text-slate-400 text-[10px] font-medium italic">Verified AI</span>
                  </div>
                  <Link 
                    to={`/${crop}Recognition`}
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg text-[11px] font-bold hover:bg-emerald-600 transition-colors shadow-md"
                  >
                    Launch
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Combined Engine Section */}
        <div className="relative border-t border-slate-200 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Leaf className="text-emerald-500 w-4 h-4" />
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Combined Engine</h2>
            </div>
            <button
              onClick={() => setShowCropList(!showCropList)}
              className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100"
            >
              {showCropList ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showCropList ? "Hide Catalog" : "View Catalog"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="lg:w-1/4 w-full">
                <img 
                  src={allcrops} 
                  alt="Crops"
                  className="w-full h-32 object-cover rounded-xl shadow-inner border border-slate-100"
                  onError={(e) => { e.target.src = CROP_IMAGES.Default }}
                />
              </div>
              <div className="lg:w-3/4">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Unified Pathology Model</h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium">
                  Supports 14+ species with a custom-trained CNN to detect 38+ disease classes.
                </p>
                <Link 
                  to="/DiseaseRecognition"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-all shadow-md"
                >
                  <Zap size={12} fill="currentColor" />
                  Start Diagnosis
                </Link>
              </div>
            </div>

            <AnimatePresence>
              {showCropList && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100"
                >
                  {fruits.map((fruit) => (
                    <div key={fruit.name} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <h4 className="font-bold text-slate-800 text-[11px] mb-1">{fruit.name}</h4>
                      <p className="text-[9px] text-slate-400 font-medium truncate">Pathology Scan Active</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}