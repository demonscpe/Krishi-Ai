import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, ArrowLeft, Sparkles, Loader2, AlertCircle, User, MapPin, DollarSign, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const FARMER_CATEGORIES = ['Small', 'Marginal', 'Medium', 'Large'];

const DEMO_PROGRAMS = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    description: 'Direct income support of ₹6,000/year to all landholding farmer families. Benefits are transferred directly to bank accounts.',
    benefit_amount: '₹6,000 per year',
    eligibility_rules: { land_max: 10, all_states: true, categories: ['Small', 'Marginal', 'Medium'] },
  },
  {
    id: 'pmjay',
    name: 'Ayushman Bharat PM-JAY',
    description: 'Health insurance coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    benefit_amount: '₹5,00,000 health cover',
    eligibility_rules: { land_max: 5, all_states: true, categories: ['Small', 'Marginal', 'Medium'] },
  },
  {
    id: 'rythu-bharosa',
    name: 'Rythu Bharosa (AP)',
    description: 'State-level investment support for farmers in Andhra Pradesh providing financial assistance for cultivation.',
    benefit_amount: '₹13,500 per year',
    eligibility_rules: { land_max: 10, states: ['Andhra Pradesh'], categories: ['Small', 'Marginal', 'Medium', 'Large'] },
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card Scheme',
    description: 'Provides adequate and timely credit support to farmers for their cultivation needs including post-harvest expenses.',
    benefit_amount: 'Up to ₹3,00,000 loan',
    eligibility_rules: { land_max: 15, all_states: true, categories: ['Small', 'Marginal', 'Medium', 'Large'] },
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana',
    description: 'Comprehensive crop insurance scheme providing financial coverage against crop loss due to natural calamities.',
    benefit_amount: 'Subsidized premiums starting at 2%',
    eligibility_rules: { land_max: 10, all_states: true, categories: ['Small', 'Marginal', 'Medium'] },
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana',
    description: 'Ensures access to protective irrigation and improves water use efficiency through micro-irrigation systems.',
    benefit_amount: 'Subsidy up to 55%',
    eligibility_rules: { land_max: 10, all_states: true, categories: ['Small', 'Marginal', 'Medium', 'Large'] },
  },
];

const FarmerBenefits = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showEligibilityForm, setShowEligibilityForm] = useState(null);
  const [eligibilityInput, setEligibilityInput] = useState({ land_size: '', state: '', category: '', income: '' });
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [eligibilityError, setEligibilityError] = useState(null);

  useEffect(() => { fetchPrograms(); }, []);

  const fetchPrograms = async () => {
    setIsLoading(true); setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/tools/farmer-benefits`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch {
      setPrograms(DEMO_PROGRAMS);
    } finally { setIsLoading(false); }
  };

  const filteredPrograms = programs.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  const handleCheckEligibility = async (programId) => {
    setIsChecking(true); setEligibilityError(null); setEligibilityResult(null);

    setTimeout(() => {
      const program = DEMO_PROGRAMS.find(p => p.id === programId);
      if (!program) { setEligibilityError('Program not found'); setIsChecking(false); return; }

      const rules = program.eligibility_rules || {};
      const landSize = parseFloat(eligibilityInput.land_size) || 0;
      const state = eligibilityInput.state;
      const category = eligibilityInput.category;
      const income = parseInt(eligibilityInput.income) || 0;

      const checks = [];

      if (rules.land_max && landSize > rules.land_max) {
        checks.push({ program: program.name, status: 'not_eligible', reason: `Land holding (${landSize} acres) exceeds max limit of ${rules.land_max} acres` });
      } else if (landSize <= 0) {
        checks.push({ program: program.name, status: 'not_eligible', reason: 'Land size is required for eligibility' });
      } else {
        if (!rules.all_states && rules.states && !rules.states.includes(state)) {
          checks.push({ program: program.name, status: 'not_eligible', reason: `This program is only available in ${rules.states.join(', ')}` });
        } else if (rules.categories && !rules.categories.includes(category)) {
          checks.push({ program: program.name, status: 'not_eligible', reason: `This program is for ${rules.categories.join(', ')} farmers` });
        } else if (income > 150000 && ['pmjay', 'pm-kisan'].includes(programId)) {
          checks.push({ program: program.name, status: 'not_eligible', reason: 'Annual income exceeds the threshold for this scheme' });
        } else {
          checks.push({ program: program.name, status: 'eligible', reason: 'You meet all eligibility criteria.' });
        }
      }
      setEligibilityResult({ results: checks });
      setIsChecking(false);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl text-center">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} /> Farmer Welfare
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Farmer Benefit Programs</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">Check eligibility for PM-KISAN, PM-JAY, Rythu Bharosa, and more welfare schemes</p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 p-6 shadow-2xl shadow-emerald-950/25 sm:p-10">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm hover:bg-white/20 transition-all">
          <ArrowLeft size={16} /> Back
        </button>

        {/* page content header is provided by the hero section above */}

        <div className="relative max-w-md mx-auto mb-10">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search benefit programs..."
            className="w-full rounded-xl bg-white/10 border border-white/20 pl-11 pr-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 placeholder:text-white/30" />
        </div>

        {isLoading && (<div className="flex items-center justify-center py-20"><Loader2 size={36} className="animate-spin text-emerald-400" /></div>)}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Heart size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/60 font-medium">No programs found.</p>
              </div>
            ) : (
              filteredPrograms.map((program, idx) => (
                <div key={idx} className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-2xl" />
                  <h3 className="text-base font-extrabold text-white mb-2 leading-snug">{program.name}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{program.description}</p>
                  {program.benefit_amount && (
                    <p className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-1">
                      <DollarSign size={14} /> {program.benefit_amount}
                    </p>
                  )}
                  <button onClick={() => { setShowEligibilityForm(program.id || idx); setEligibilityResult(null); setEligibilityError(null); setEligibilityInput({ land_size: '', state: '', category: '', income: '' }); }}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all">
                    Check Eligibility
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Eligibility Form Modal */}
        {showEligibilityForm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowEligibilityForm(null)}>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-extrabold text-white mb-2">Check Eligibility</h2>
              <p className="text-sm text-white/50 mb-6">Fill in your details to check eligibility for this program.</p>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-emerald-400 mb-1"><MapPin size={14} /> State</label>
                  <select value={eligibilityInput.state} onChange={(e) => setEligibilityInput({...eligibilityInput, state: e.target.value})}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 appearance-none cursor-pointer">
                    <option value="" className="bg-slate-800">Select state...</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-emerald-400 mb-1"><User size={14} /> Farmer Category</label>
                  <select value={eligibilityInput.category} onChange={(e) => setEligibilityInput({...eligibilityInput, category: e.target.value})}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 appearance-none cursor-pointer">
                    <option value="" className="bg-slate-800">Select category...</option>
                    {FARMER_CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-emerald-400 mb-1"><MapPin size={14} /> Land Size (acres)</label>
                  <input type="number" value={eligibilityInput.land_size} onChange={(e) => setEligibilityInput({...eligibilityInput, land_size: e.target.value})}
                    min="0" step="0.1" className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 placeholder:text-white/30" placeholder="e.g. 2.5" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-emerald-400 mb-1"><DollarSign size={14} /> Annual Income</label>
                  <input type="number" value={eligibilityInput.income} onChange={(e) => setEligibilityInput({...eligibilityInput, income: e.target.value})}
                    min="0" className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-400 placeholder:text-white/30" placeholder="e.g. 50000" />
                </div>
                <button onClick={() => handleCheckEligibility(showEligibilityForm)} disabled={isChecking}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-60">
                  {isChecking ? <><Loader2 size={16} className="animate-spin inline mr-2" />Checking...</> : 'Check Eligibility'}
                </button>
                {eligibilityError && (<div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl flex items-start gap-2"><AlertCircle size={14} className="mt-0.5 shrink-0" /> {eligibilityError}</div>)}
                {eligibilityResult && (
                  <div className="space-y-2">
                    {eligibilityResult.results?.map((r, i) => (
                      <div key={i} className={`p-4 rounded-xl border text-sm ${r.status === 'eligible' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {r.status === 'eligible' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                          <p className="font-bold">{r.program}</p>
                        </div>
                        <p className="text-xs opacity-80 ml-7">{r.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowEligibilityForm(null)} className="w-full mt-4 rounded-xl bg-white/10 px-4 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all">
                Close
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerBenefits;

