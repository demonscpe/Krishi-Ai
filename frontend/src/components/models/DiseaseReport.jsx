import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const DiseaseReport = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate('/disease')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Disease Hub
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Report Generation
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Disease Report</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Download comprehensive PDF reports of your disease detection results and analysis.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 p-8 sm:p-12 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 mb-6">
            <FileText className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Report Module</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Generate and download detailed PDF reports containing disease identification, severity assessment, treatment recommendations, and prevention guidelines.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> PDF Download</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Comprehensive Analysis</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Treatment Summary</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiseaseReport;

