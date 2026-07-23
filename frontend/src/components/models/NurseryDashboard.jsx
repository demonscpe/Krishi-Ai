import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const NurseryDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate('/nursery')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Nursery Hub
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Analytics & Dashboard
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Nursery Dashboard</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Sales analytics, order summaries, and revenue tracking for your nursery business.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 p-8 sm:p-12 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mb-6">
            <BarChart3 className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Dashboard Module</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            View comprehensive analytics including order summaries, revenue tracking, plant availability, and sales trends.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Sales Analytics</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Order Summaries</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Revenue Tracking</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NurseryDashboard;

