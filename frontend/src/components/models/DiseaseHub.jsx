import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bug, Activity, Pill, Shield, Bot, FileText, BarChart3, Leaf, ArrowRight } from 'lucide-react';

const modules = [
  { path: '/disease/identify', icon: Search, label: 'Plant Identification', desc: 'Identify plant species from leaf, fruit, or stem images', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-100' },
  { path: '/disease/detect', icon: Bug, label: 'Disease Detection', desc: 'Detect and classify plant diseases with AI', color: 'from-red-500 to-red-600', shadow: 'shadow-red-100' },
  { path: '/disease/severity', icon: Activity, label: 'Severity Assessment', desc: 'Assess disease severity and affected area percentage', color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-100' },
  { path: '/disease/treatment', icon: Pill, label: 'Treatment', desc: 'Get chemical and organic treatment recommendations', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-100' },
  { path: '/disease/prevention', icon: Shield, label: 'Prevention Guide', desc: 'Learn prevention methods and best practices', color: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-100' },
  { path: '/disease/chatbot', icon: Bot, label: 'AI Plant Doctor', desc: 'Chat with AI assistant about plant health', color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-100' },
  { path: '/disease/history', icon: FileText, label: 'Disease Report', desc: 'Download comprehensive PDF reports', color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-100' },
  { path: '/disease/history', icon: BarChart3, label: 'History', desc: 'View disease history and analytics dashboard', color: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-100' },
];

const quickLinks = [
  { path: '/SugarcaneRecognition', label: 'Sugarcane Disease', desc: 'Specialized engine for sugarcane' },
  { path: '/PaddyRecognition', label: 'Paddy Disease', desc: 'Specialized engine for paddy' },
  { path: '/DiseaseRecognition', label: 'Combined Engine', desc: '14+ species, 38+ disease classes' },
];

export default function DiseaseHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1920')] bg-cover bg-center opacity-15" />
        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Leaf size={14} className="text-lime-300" /> AI Plant Disease Intelligence
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Protect your crops with AI-powered disease insights.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Identify plants, detect diseases early, assess severity, get treatment plans, and prevent future outbreaks — all in one platform.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        {/* Module Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.path}
                onClick={() => navigate(mod.path)}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 text-left shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color} text-white shadow-lg ${mod.shadow}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{mod.label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight size={14} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Links Section */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Leaf className="text-emerald-600" size={20} />
            Existing Specialized Engines
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{link.label}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="text-emerald-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

