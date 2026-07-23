import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Search, ClipboardList, Package, 
  BarChart3, User, ShoppingCart, MapPin,
  ArrowRight, Sparkles, CheckCircle2, Leaf
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const nurseryModules = [
  {
    id: 'search',
    title: 'Browse Nurseries',
    description: 'Search for nearby nurseries, plants, and seedlings available in your area.',
    icon: Search,
    color: 'bg-green-500',
    gradient: 'from-green-600 to-green-700',
    lightBg: 'bg-green-50',
    lightText: 'text-green-600',
    path: '/nursery/search',
    features: ['Nearby nursery finder', 'Plant search', 'GPS location detection'],
  },
  {
    id: 'orders',
    title: 'My Orders',
    description: 'View your order history, track status, and manage ongoing deliveries.',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    gradient: 'from-blue-600 to-blue-700',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
    path: '/nursery/orders',
    features: ['Order tracking', 'Status updates', 'Order history'],
  },
  {
    id: 'inventory',
    title: 'Nursery Inventory',
    description: 'For nursery owners — manage your plant inventory, stock, and pricing.',
    icon: Package,
    color: 'bg-purple-500',
    gradient: 'from-purple-600 to-purple-700',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-600',
    path: '/nursery/inventory',
    features: ['Add/Edit plants', 'Stock management', 'Price updates'],
  },
  {
    id: 'dashboard',
    title: 'Nursery Dashboard',
    description: 'Analytics dashboard with orders summary, revenue, and plant availability.',
    icon: BarChart3,
    color: 'bg-amber-500',
    gradient: 'from-amber-600 to-amber-700',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-600',
    path: '/nursery/dashboard',
    features: ['Sales analytics', 'Order summaries', 'Revenue tracking'],
  },
  {
    id: 'profile',
    title: 'Nursery Profile',
    description: 'Manage your nursery profile, contact info, location, and business hours.',
    icon: User,
    color: 'bg-emerald-500',
    gradient: 'from-emerald-600 to-emerald-700',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-600',
    path: '/nursery/profile',
    features: ['Business details', 'Location settings', 'Operating hours'],
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    description: 'Platform admin — manage nurseries, approvals, and platform-wide analytics.',
    icon: Store,
    color: 'bg-red-500',
    gradient: 'from-red-600 to-red-700',
    lightBg: 'bg-red-50',
    lightText: 'text-red-600',
    path: '/nursery/admin',
    features: ['Nursery approvals', 'User management', 'Platform analytics'],
  },
];

const NurseryHub = () => {
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
              <Sparkles size={14} className="text-lime-300" /> Nursery discovery & ordering platform
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find & Order from Nearby Nurseries
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Browse local nurseries, search for plants and seedlings, place orders, and get them delivered — all in one place.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-emerald-100">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> GPS-powered nursery finder</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Real-time stock & pricing</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Pickup & delivery options</span>
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
              {nurseryModules.map((module) => {
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
            <Sparkles size={14} className="text-lime-300" /> Integrated marketplace
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Connect with local nurseries</h2>
          <p className="max-w-2xl mx-auto text-sm leading-relaxed text-emerald-50/80">
            Whether you're a farmer looking for quality seedlings or a nursery owner managing inventory, 
            the Nursery Platform brings everything together in one seamless experience.
          </p>
        </div>
      </main>
    </div>
  );
};

export default NurseryHub;

