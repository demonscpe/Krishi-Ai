import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, FileText, Activity, Sprout, 
  Leaf, ArrowRight, Sparkles, CheckCircle2,
  Droplets, Thermometer, Beaker, Shield
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const soilModules = [
  {
    id: 'image-analysis',
    title: 'Soil Image Analysis',
    description: 'Upload a soil photo to analyze type, color, texture, and condition using AI vision.',
    icon: Camera,
    color: 'bg-blue-500',
    gradient: 'from-blue-600 to-blue-700',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    path: '/soil/image-analysis',
    features: ['AI-powered recognition', 'Multi-output analysis', 'Instant results'],
  },
  {
    id: 'test-input',
    title: 'Soil Test Input',
    description: 'Enter soil test values manually or upload a lab report PDF for auto-fill via OCR.',
    icon: FileText,
    color: 'bg-purple-500',
    gradient: 'from-purple-600 to-purple-700',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-600',
    path: '/soil/test-input',
    features: ['Manual entry form', 'PDF OCR parsing', 'Validation & review'],
  },
  {
    id: 'health-analyzer',
    title: 'AI Soil Health Analyzer',
    description: 'Get a comprehensive health score with per-nutrient breakdown and recommendations.',
    icon: Activity,
    color: 'bg-emerald-500',
    gradient: 'from-emerald-600 to-emerald-700',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-600',
    path: '/soil/health-analyzer',
    features: ['Health score 0-100', 'Nutrient status cards', 'Actionable insights'],
  },
  {
    id: 'fertilizer',
    title: 'Fertilizer Recommendation',
    description: 'Get personalized fertilizer recommendations with exact quantities per acre.',
    icon: Sprout,
    color: 'bg-amber-500',
    gradient: 'from-amber-600 to-amber-700',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
    path: '/soil/fertilizer',
    features: ['Crop-specific plans', 'Quantity per acre', 'Organic options'],
  },
  {
    id: 'quality',
    title: 'Soil Quality Prediction',
    description: 'Predict overall soil quality class and fertility score from lab parameters.',
    icon: Shield,
    color: 'bg-green-500',
    gradient: 'from-green-600 to-green-700',
    lightBg: 'bg-green-50',
    lightText: 'text-green-600',
    path: '/soil/quality',
    features: ['Quality classification', 'Fertility scoring', 'Crop suggestions'],
  },
];

const SoilHub = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> AI soil intelligence suite
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Complete Soil Intelligence Platform
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              From image analysis to fertilizer recommendations — manage every aspect of your soil health in one place.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-emerald-100">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> AI-powered analysis</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Lab-accurate insights</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Actionable recommendations</span>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Choose a module</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">What would you like to do?</h2>
              <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {soilModules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => navigate(module.path)}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
                  >
                    {/* Top gradient accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${module.gradient} opacity-80`} />

                    {/* Icon */}
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${module.lightBg}`}>
                      <Icon className={`h-6 w-6 ${module.lightText}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-slate-900 mb-2">{module.title}</h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-slate-500 mb-4">{module.description}</p>

                    {/* Features */}
                    <div className="space-y-1.5 mb-4">
                      {module.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 transition-all group-hover:gap-2">
                      Open module <ArrowRight size={15} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-10 bg-gradient-to-br from-green-700 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-lime-300" /> Integrated platform
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Modules work together seamlessly</h2>
          <p className="max-w-2xl mx-auto text-sm leading-relaxed text-emerald-50/80">
            Start with soil image analysis or manual test input, then feed those results into the health analyzer 
            and fertilizer recommendation engine — all within the same integrated platform.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SoilHub;

