import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, ArrowLeft, Sparkles, Loader2, AlertCircle, User, MapPin, DollarSign } from 'lucide-react';
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
      if (!res.ok) throw new Error('Failed to load programs');
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const filteredPrograms = programs.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  const handleCheckEligibility = async (programId) => {
    setIsChecking(true); setEligibilityError(null); setEligibilityResult(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/tools/farmer-benefits/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: programId, ...eligibilityInput, land_size: parseFloat(eligibilityInput.land_size) || 0 }),
      });
      if (!res.ok) throw new Error('Check failed');
      const data = await res.json();
      setEligibilityResult(data);
    } catch (err) { setEligibilityError(err.message); }
    finally { setIsChecking(false); }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Farmer welfare
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Farmer Benefits</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Check your eligibility for PM-JAY, Rythu Bharosa, PM-KISAN, and more welfare programs.
            </p>
          </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            <div className="relative mb-8">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search benefit programs..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" />
            </div>

            {isLoading && (<div className="flex items-center justify-center py-16"><Loader2 size={32} className="animate-spin text-emerald-600" /></div>)}
            {error && (<div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl mb-6">{error}</div>)}

            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-slate-400">
                    <Heart size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No programs found.</p>
                  </div>
                ) : (
                  filteredPrograms.map((program, idx) => (
                    <div key={idx} className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <h3 className="text-lg font-extrabold text-slate-900 mb-2">{program.name}</h3>
                      <p className="text-sm leading-relaxed text-slate-500 mb-4">{program.description}</p>
                      {program.benefit_amount && (
                        <p className="text-sm font-bold text-emerald-600 mb-4">
                          <DollarSign size={14} className="inline" /> Benefit: {program.benefit_amount}
                        </p>
                      )}
                      <button onClick={() => {
                        setShowEligibilityForm(program.id || idx);
                        setEligibilityResult(null); setEligibilityError(null);
                        setEligibilityInput({ land_size: '', state: '', category: '', income: '' });
                      }} className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                        Check Eligibility
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
      </main>

      {showEligibilityForm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEligibilityForm(null)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Check Eligibility</h2>
            <p className="text-sm text-slate-500 mb-6">Fill details to check eligibility.</p>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600 mb-1"><MapPin size={14} /> State</label>
                <select value={eligibilityInput.state} onChange={(e) => setEligibilityInput({...eligibilityInput, state: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500">
                  <option value="">Select state...</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600 mb-1"><User size={14} /> Farmer Category</label>
                <select value={eligibilityInput.category} onChange={(e) => setEligibilityInput({...eligibilityInput, category: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500">
                  <option value="">Select category...</option>
                  {FARMER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600 mb-1"><MapPin size={14} /> Land Size (acres)</label>
                <input type="number" value={eligibilityInput.land_size} onChange={(e) => setEligibilityInput({...eligibilityInput, land_size: e.target.value})}
                  min="0" step="0.1" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="e.g. 2.5" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600 mb-1"><DollarSign size={14} /> Annual Income</label>
                <input type="number" value={eligibilityInput.income} onChange={(e) => setEligibilityInput({...eligibilityInput, income: e.target.value})}
                  min="0" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="e.g. 50000" />
              </div>
              <button onClick={() => handleCheckEligibility(showEligibilityForm)} disabled={isChecking}
                className="w-full rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60">
                {isChecking ? <><Loader2 size={16} className="animate-spin inline mr-2" />Checking...</> : 'Check Eligibility'}
              </button>
              {eligibilityError && (<div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2"><AlertCircle size={14} className="mt-0.5 shrink-0" /> {eligibilityError}</div>)}
              {eligibilityResult && (
                <div className="space-y-2">
                  {eligibilityResult.results?.map((r, i) => (
                    <div key={i} className={`p-4 rounded-xl border text-sm ${r.status === 'eligible' ? 'bg-green-50 border-green-200 text-green-700' : r.status === 'not_eligible' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                      <p className="font-bold">{r.program}</p>
                      <p className="text-xs mt-1">{r.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowEligibilityForm(null)} className="w-full mt-4 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
              Close
            </button>
          </div>
      )}
    </div>
  );
};

export default FarmerBenefits;</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>
