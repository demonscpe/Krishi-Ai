import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Search, ArrowLeft, Sparkles, ExternalLink, Loader2, Filter, Shield, Banknote, Umbrella, Cog } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const CATEGORIES = ['all', 'subsidy', 'insurance', 'loan', 'equipment'];

const CATEGORY_META = {
  subsidy: { icon: Banknote, color: 'from-green-400 to-emerald-500', bg: 'bg-green-500/20', text: 'text-green-400', label: 'Subsidy' },
  insurance: { icon: Umbrella, color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Insurance' },
  loan: { icon: Landmark, color: 'from-purple-400 to-violet-500', bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Loan' },
  equipment: { icon: Cog, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Equipment' },
};

const DEMO_SCHEMES = [
  {
    name: 'PM-KISAN Samman Nidhi',
    description: 'Income support of ₹6,000 per year to all landholding farmer families, provided in three equal installments of ₹2,000 each.',
    category: 'subsidy',
    eligibility: 'All landholding farmer families with cultivable land',
    benefit: '₹6,000/year (₹2,000 per installment)',
    application_link: 'https://pmkisan.gov.in/',
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Comprehensive crop insurance covering pre-sowing to post-harvest losses against natural calamities, pests, and diseases.',
    category: 'insurance',
    eligibility: 'All farmers growing notified crops in notified areas',
    benefit: 'Coverage sum insured at very low premium rates',
    application_link: 'https://pmfby.gov.in/',
  },
  {
    name: 'Kisan Credit Card (KCC) Scheme',
    description: 'Provides short-term crop loans up to ₹3 lakh at affordable interest rates with flexible repayment options.',
    category: 'loan',
    eligibility: 'All farmers, sharecroppers, tenant farmers, and Self Help Groups',
    benefit: 'Loans up to ₹3 lakh at 7% interest (4% on prompt repayment)',
    application_link: 'https://www.kisancreditcard.in/',
  },
  {
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    description: 'Promotes agricultural mechanization by providing subsidies on purchase of tractors, harvesters, and other farm equipment.',
    category: 'equipment',
    eligibility: 'Small and marginal farmers, SC/ST farmers, women farmers',
    benefit: 'Subsidy up to 50% on farm machinery',
    application_link: 'https://agrimachinery.nic.in/',
  },
  {
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
    description: 'Ensures access to protective irrigation to every farm (Har Khet Ko Pani) and improves water use efficiency.',
    category: 'subsidy',
    eligibility: 'All farmers in identified districts',
    benefit: 'Subsidy for micro-irrigation systems up to 55%',
    application_link: 'https://pmksy.gov.in/',
  },
  {
    name: 'National Agricultural Market (e-NAM)',
    description: 'Online pan-India trading platform for agricultural commodities providing better price discovery and transparent trade.',
    category: 'equipment',
    eligibility: 'All farmers, traders, and commission agents',
    benefit: 'Better price discovery and transparent trading',
    application_link: 'https://enam.gov.in/',
  },
  {
    name: 'Rythu Bharosa (Andhra Pradesh)',
    description: 'State-level investment support scheme providing financial assistance of ₹13,500 per year to each farmer family.',
    category: 'subsidy',
    eligibility: 'All farmer families in Andhra Pradesh',
    benefit: '₹13,500/year per farmer family',
    application_link: 'https://rythubharosa.ap.gov.in/',
  },
  {
    name: 'Soil Health Card Scheme',
    description: 'Provides soil health cards to farmers with recommendations on nutrient management and fertilizer application.',
    category: 'subsidy',
    eligibility: 'All farmers with agricultural land',
    benefit: 'Free soil testing and nutrient recommendations',
    application_link: 'https://soilhealth.dac.gov.in/',
  },
  {
    name: 'Agriculture Infrastructure Fund (AIF)',
    description: 'Medium to long-term debt financing facility for investment in post-harvest management infrastructure and community farming assets.',
    category: 'loan',
    eligibility: 'Farmers, FPOs, PACS, startups, and agri-entrepreneurs',
    benefit: 'Interest subvention of 3% per annum on loans up to ₹2 crore',
    application_link: 'https://agriinfra.dac.gov.in/',
  },
  {
    name: 'National Bee Keeping & Honey Mission',
    description: 'Promotes scientific beekeeping and honey production with financial assistance for equipment and training.',
    category: 'equipment',
    eligibility: 'Farmers, beekeepers, Self Help Groups, FPOs',
    benefit: 'Subsidy up to 50% for beekeeping equipment',
    application_link: 'https://nbb.gov.in/',
  },
];

const GovtSchemes = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => { fetchSchemes(); }, []);

  useEffect(() => {
    let result = schemes;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
    }
    if (category !== 'all') result = result.filter(s => s.category === category);
    setFilteredSchemes(result);
  }, [search, category, schemes]);

  const fetchSchemes = async () => {
    setIsLoading(true); setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/tools/govt-schemes`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSchemes(data.schemes || []);
      setFilteredSchemes(data.schemes || []);
    } catch {
      setSchemes(DEMO_SCHEMES);
      setFilteredSchemes(DEMO_SCHEMES);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl text-center">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} /> Government Schemes
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Agriculture Schemes India</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">Browse subsidies, insurance plans, loans, and equipment support for farmers</p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm hover:bg-white/20 transition-all">
          <ArrowLeft size={16} /> Back
        </button>

        {/* page content header is provided by the hero section above */}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes..."
              className="w-full rounded-xl bg-white/10 border border-white/20 pl-11 pr-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 placeholder:text-white/30" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${category === c ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (<div className="flex items-center justify-center py-20"><Loader2 size={36} className="animate-spin text-emerald-400" /></div>)}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Landmark size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/60 font-medium">No schemes found.</p>
              </div>
            ) : (
              filteredSchemes.map((scheme, idx) => {
                const meta = CATEGORY_META[scheme.category] || CATEGORY_META.subsidy;
                const Icon = meta.icon;
                return (
                  <div key={idx} className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.color} rounded-t-2xl`} />
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg ${meta.bg}`}><Icon size={16} className={meta.text} /></div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${meta.text}`}>{meta.label}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mb-2 leading-snug">{scheme.name}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">{scheme.description}</p>
                    {scheme.eligibility && (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Who can apply</p>
                        <p className="text-sm text-white/70">{scheme.eligibility}</p>
                      </div>
                    )}
                    {scheme.benefit && (
                      <p className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-1">
                        <Shield size={14} /> {scheme.benefit}
                      </p>
                    )}
                    {scheme.application_link && (
                      <a href={scheme.application_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors group/link">
                        Apply Now <ExternalLink size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GovtSchemes;

