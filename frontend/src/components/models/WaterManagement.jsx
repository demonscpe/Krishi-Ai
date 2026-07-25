import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Sun, CloudRain, Sprout,
  ArrowRight, Sparkles, CheckCircle2, Leaf
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const waterModules = [
  {
    id: 'rainwater-harvesting',
    title: 'Rainwater Harvesting',
    description: 'Learn the basics of setting up rainwater harvesting systems on your farm to conserve water.',
    icon: CloudRain,
    color: 'bg-blue-500',
    gradient: 'from-blue-600 to-blue-700',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    features: ['System setup guide', 'Collection optimization', 'Storage best practices'],
  },
  {
    id: 'smart-irrigation',
    title: 'Smart Irrigation',
    description: 'Adopt IoT-based smart irrigation systems to monitor water usage and optimize crop watering.',
    icon: Droplets,
    color: 'bg-cyan-500',
    gradient: 'from-cyan-600 to-cyan-700',
    lightBg: 'bg-cyan-50',
    lightText: 'text-cyan-600',
    features: ['Drip irrigation', 'IoT monitoring', 'Automated scheduling'],
  },
  {
    id: 'water-conservation',
    title: 'Water Conservation',
    description: 'Explore water-saving techniques like moisture retention, mulching, and efficient usage methods.',
    icon: Sun,
    color: 'bg-amber-500',
    gradient: 'from-amber-600 to-amber-700',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
    features: ['Mulching techniques', 'Moisture retention', 'Usage optimization'],
  },
  {
    id: 'tech-innovations',
    title: 'Tech Innovations',
    description: 'Stay updated on the latest technologies in water-saving tools and sustainable farming innovations.',
    icon: Sprout,
    color: 'bg-emerald-500',
    gradient: 'from-emerald-600 to-emerald-700',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-600',
    features: ['Latest tools', 'Sustainable tech', 'Future solutions'],
  },
];

const WaterManagement = () => {
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
              <Sparkles size={14} className="text-lime-300" /> Sustainable water management
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Water Management Solutions
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Learn sustainable water management techniques, including rainwater harvesting, efficient water use, and smart irrigation.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-emerald-100">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Rainwater harvesting</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Smart irrigation</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Water conservation</span>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Explore modules</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">Water Management Strategies</h2>
              <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {waterModules.map((module) => {
                const Icon = module.icon;
                return (
                  <div
                    key={module.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent"
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-10 bg-gradient-to-br from-blue-700 to-cyan-600 rounded-3xl p-8 sm:p-12 text-white text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-lime-300" /> Find local suppliers
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Access water management resources</h2>
          <p className="max-w-2xl mx-auto text-sm leading-relaxed text-blue-50/80 mb-6">
            Access a database of local suppliers and installers for water-saving infrastructure, rainwater harvesting systems, and more.
          </p>
          <button className="rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-all">
            Find Local Suppliers
          </button>
        </div>
      </main>
    </div>
  );
};

export default WaterManagement;

