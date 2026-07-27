import bgHero from "../../assets/bgHero.png";
import img1 from "../../assets/img1.jpg";
import img2 from "../../assets/img2.jpg";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowRight, TrendingUp, Droplets, ShieldAlert, Wallet, Calendar,
  Printer, RotateCw, Leaf, CheckCircle2, AlertCircle, Sprout,
  Zap, TrendingDown, BarChart3, Clock, BookOpen, Search, X,
} from 'lucide-react';

/* ======================================================================
   AGRICULTURAL CROP ROTATION KNOWLEDGE BASE
   The best practice: show multi-year cycles, soil progression, nutrient
   balance, and field-readiness action plans — not just next-season pick.
   ====================================================================== */

const CROP_PROFILE = {
  Chickpea:  { season: 'Rabi',   months: 'Oct-Mar', family: 'Legume',  depletes: ['P'], restores: ['N'], baseYield: 1.8, waterNeeds: 'Low',    nitrogen: -5 },
  Mustard:   { season: 'Rabi',   months: 'Oct-Nov', family: 'Oilseed', depletes: ['P','K'], restores: [], baseYield: 1.5, waterNeeds: 'Low',    nitrogen: 0 },
  Wheat:     { season: 'Rabi',   months: 'Nov-Apr', family: 'Cereal',  depletes: ['N','P'], restores: [], baseYield: 3.5, waterNeeds: 'Med',    nitrogen: -60 },
  Maize:     { season: 'Kharif', months: 'Jun-Sep', family: 'Cereal',  depletes: ['N','P','K'], restores: [], baseYield: 6.0, waterNeeds: 'Med',    nitrogen: -80 },
  Groundnut: { season: 'Kharif', months: 'Jun-Oct', family: 'Legume',  depletes: ['P','K'], restores: ['N'], baseYield: 2.0, waterNeeds: 'Med',    nitrogen: -10 },
  Soybean:   { season: 'Kharif', months: 'Jun-Sep', family: 'Legume',  depletes: [], restores: ['N','P'], baseYield: 2.5, waterNeeds: 'Med',    nitrogen: +40 },
  Rice:      { season: 'Kharif', months: 'Jun-Oct', family: 'Cereal',  depletes: ['N','P','K'], restores: [], baseYield: 5.0, waterNeeds: 'High',   nitrogen: -70 },
};

const MARKET_DATA = {
  Chickpea: { price: 5800, demand: 'High', msp: 5440 },
  Mustard: { price: 5650, demand: 'Medium', msp: 5450 },
  Wheat: { price: 2600, demand: 'Medium', msp: 2275 },
  Maize: { price: 2200, demand: 'Low', msp: 2090 },
  Groundnut: { price: 6200, demand: 'High', msp: 6377 },
  Soybean: { price: 4800, demand: 'Medium', msp: 4600 },
  Rice: { price: 2500, demand: 'Medium', msp: 2400 },
};

const COST_PER_HECTARE = {
  Chickpea: 28000, Mustard: 22000, Wheat: 35000, Maize: 32000,
  Groundnut: 40000, Soybean: 30000, Rice: 45000, DEFAULT: 30000,
};

const ROTATION_CHAINS = {
  Rice: ['Chickpea', 'Wheat', 'Mustard'],
  Wheat: ['Soybean', 'Mustard', 'Maize'],
  Cotton: ['Chickpea', 'Mustard', 'Wheat'],
  Maize: ['Chickpea', 'Wheat', 'Mustard'],
  Groundnut: ['Wheat', 'Mustard', 'Chickpea'],
  Soybean: ['Wheat', 'Mustard', 'Groundnut'],
  DEFAULT: ['Wheat', 'Chickpea', 'Mustard'],
};

// Full searchable vocabulary for the autocomplete bar. Crops without a full
// CROP_PROFILE entry still resolve fine — they simply fall back to
// ROTATION_CHAINS.DEFAULT when a plan is generated.
const KNOWN_CROPS = [
  'Wheat', 'Rice', 'Maize', 'Chickpea', 'Mustard', 'Groundnut', 'Soybean',
  'Cotton', 'Sugarcane', 'Paddy', 'Bajra', 'Jowar', 'Barley', 'Sunflower', 'Cumin',
];

/* ======================================================================
   SEARCH ALGORITHM
   Ranks crop names against partial/fuzzy user input:
   1) exact match          -> 100
   2) starts-with match    -> ~90, shorter extra length scores higher
   3) contains match       -> ~70
   4) subsequence match     -> 45  (e.g. "wht" -> "Wheat")
   5) edit-distance <= 2   -> up to 30 (typo tolerance, e.g. "maiz" -> "Maize")
   Anything else is dropped.
   ====================================================================== */

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function isSubsequence(query, target) {
  let qi = 0;
  for (let i = 0; i < target.length && qi < query.length; i++) {
    if (target[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

function scoreCrop(query, cropName) {
  const q = query.trim().toLowerCase();
  const c = cropName.toLowerCase();
  if (!q) return 1;
  if (c === q) return 100;
  if (c.startsWith(q)) return 90 - (c.length - q.length);
  if (c.includes(q)) return 70 - (c.length - q.length);
  if (isSubsequence(q, c)) return 45;
  const dist = levenshtein(q, c);
  if (dist <= 2) return 30 - dist * 8;
  return -1;
}

function getSuggestions(query, limit = 6) {
  if (!query.trim()) {
    return KNOWN_CROPS.slice(0, limit).map((c) => ({ crop: c, score: 1 }));
  }
  return KNOWN_CROPS
    .map((c) => ({ crop: c, score: scoreCrop(query, c) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.crop.localeCompare(b.crop))
    .slice(0, limit);
}

function resolveCropName(input) {
  const trimmed = input.trim();
  const canonical = KNOWN_CROPS.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  return canonical || trimmed;
}

function highlightMatch(text, query) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-green-200 text-green-900 rounded-sm px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

/* ======================================================================
   SOIL HEALTH PROGRESSION
   Track how soil condition improves (or degrades) through rotation
   ====================================================================== */

function computeSoilProgression(previousCrop, top, year1next, year2next) {
  const crops = [previousCrop, top.crop, year1next, year2next];
  let health = 50;

  crops.forEach((crop, idx) => {
    const p = CROP_PROFILE[crop];
    if (!p) return;
    if (p.family === 'Legume') health += 15;
    if (idx > 0) {
      const prev = CROP_PROFILE[crops[idx - 1]];
      if (prev?.family === p.family) health -= 10;
    }
  });

  return {
    year0: Math.min(100, Math.max(0, health - 20)),
    year1: Math.min(100, Math.max(0, health)),
    year2: Math.min(100, Math.max(0, health + 10)),
    year3: Math.min(100, Math.max(0, health + 15)),
  };
}

/* ======================================================================
   3-YEAR ROTATION PLAN + FIELD ACTION CALENDAR
   ====================================================================== */

function buildActionCalendar(previousCrop, topCrop, chain) {
  const rotationCrops = [topCrop, chain[0], chain[1]];
  const actions = [];
  const cropSeasons = {
    Kharif: [6, 7, 8, 9, 10],
    Rabi: [11, 12, 1, 2, 3],
    Zaid: [3, 4, 5],
  };

  rotationCrops.forEach((crop, yearIdx) => {
    const profile = CROP_PROFILE[crop];
    if (!profile) return;

    const seasonMonths = cropSeasons[profile.season] || [];
    seasonMonths.forEach((m) => {
      actions.push({
        year: yearIdx,
        month: m,
        crop,
        action: m === seasonMonths[0] ? 'Sow' : 'Monitor',
        season: profile.season,
      });
    });
  });

  return actions;
}

/* ======================================================================
   NUTRIENT BALANCE OVER ROTATION
   ====================================================================== */

function computeNutrientBalance(previousCrop, topCrop, chain) {
  const crops = [previousCrop, topCrop, chain[0], chain[1]];
  let nitrogen = 0, phosphorus = 0, potassium = 0;

  crops.forEach((crop) => {
    const p = CROP_PROFILE[crop];
    if (!p) return;
    nitrogen += p.nitrogen;
    if (p.depletes.includes('P')) phosphorus -= 15;
    if (p.restores.includes('N')) nitrogen += 50;
  });

  return {
    nitrogen: Math.min(100, Math.max(0, 50 + nitrogen / 4)),
    phosphorus: Math.min(100, Math.max(0, 50 + phosphorus / 4)),
    potassium: Math.min(100, Math.max(0, 50 + potassium / 4)),
  };
}

/* ======================================================================
   SUSTAINABILITY METRICS
   ====================================================================== */

function computeSustainabilityImpact(topCrop, chain) {
  const crops = [topCrop, ...chain];

  const legumeCount = crops.filter((c) => CROP_PROFILE[c]?.family === 'Legume').length;
  const fertilizerReduction = legumeCount * 35;

  const families = crops.map((c) => CROP_PROFILE[c]?.family);
  const uniqueFamilies = new Set(families).size;
  const diseaseReduction = (uniqueFamilies / 3) * 60;

  const waterNeeds = crops.map((c) => CROP_PROFILE[c]?.waterNeeds || 'Med');
  const highWaterCount = waterNeeds.filter((w) => w === 'High').length;
  const waterEfficiency = highWaterCount === 0 ? 45 : Math.max(30, 60 - highWaterCount * 10);

  return {
    fertilizerReduction: Math.round(fertilizerReduction),
    diseaseReduction: Math.round(diseaseReduction),
    waterEfficiency: Math.round(waterEfficiency),
  };
}

/* ======================================================================
   FINANCIAL IMPACT
   ====================================================================== */

function computeFinancialImpact(topCrop, chain, expectedYields) {
  const crops = [topCrop, chain[0], chain[1]];
  let rotationRevenue = 0, monocultureRevenue = 0;

  crops.forEach((crop, idx) => {
    const market = MARKET_DATA[crop] || { price: 3000 };
    const cost = COST_PER_HECTARE[crop] || COST_PER_HECTARE.DEFAULT;
    const yield_ = expectedYields[idx] || 3;
    const quintals = yield_ * 10;
    const revenue = quintals * market.price;

    rotationRevenue += revenue - cost;
    const monoYield = yield_ * (1 - idx * 0.15);
    const monoRevenue = monoYield * 10 * market.price - cost;
    monocultureRevenue += monoRevenue;
  });

  return {
    rotation: Math.round(rotationRevenue),
    monoculture: Math.round(monocultureRevenue),
    benefit: Math.round(rotationRevenue - monocultureRevenue),
  };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ======================================================================
   SMART CROP SEARCH BAR
   Live autocomplete: ranks matches with the algorithm above, highlights
   matched characters, previews the next rotation chain for each option,
   and is fully keyboard-navigable (↑ ↓ Enter Esc).
   ====================================================================== */

const CropSearchInput = ({ value, onChange, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);

  const suggestions = useMemo(() => getSuggestions(value, 6), [value]);
  const exactMatch = suggestions.some(
    (s) => s.crop.toLowerCase() === value.trim().toLowerCase()
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextCrops = (crop) => ROTATION_CHAINS[crop] || ROTATION_CHAINS.DEFAULT;

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (isOpen && suggestions.length > 0) {
        e.preventDefault();
        onSelect(suggestions[highlightedIndex].crop);
        setIsOpen(false);
      }
      // otherwise let Enter fall through to submit the form
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-9 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          placeholder="Start typing... e.g. Rice, Wheat, Maize"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          required
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(''); setIsOpen(true); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            aria-label="Clear crop"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No matching crop found. Try a different spelling.
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {suggestions.map((s, idx) => {
                const chain = nextCrops(s.crop);
                const isActive = idx === highlightedIndex;
                return (
                  <li key={s.crop}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { onSelect(s.crop); setIsOpen(false); }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition ${
                        isActive ? 'bg-green-50' : 'bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800">
                          {highlightMatch(s.crop, value)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Next in rotation: {chain.join(' → ')}
                        </p>
                      </div>
                      {CROP_PROFILE[s.crop] && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                          {CROP_PROFILE[s.crop].family}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {value.trim() && !exactMatch && (
            <div className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100 bg-slate-50">
              Press Enter to use "{value.trim()}" as a custom crop
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ======================================================================
   3-YEAR ROTATION TIMELINE CARD
   ====================================================================== */

const RotationTimeline = ({ previousCrop, top, chain, soilProgression }) => {
  const yearCrops = [top.crop, chain[0], chain[1]];
  const seasonColors = { Kharif: '#3f6c33', Rabi: '#b8860b', Zaid: '#8a99a8' };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-600 mb-6">3-Year Rotation Map</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase">Before</p>
            <p className="text-2xl font-extrabold text-slate-600 mt-1">{soilProgression.year0}%</p>
          </div>
          <div className="flex-1">
            <div className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold">{previousCrop}</div>
            <p className="text-xs text-slate-500 mt-1">Current field health</p>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight size={24} className="text-slate-400 rotate-90" />
        </div>

        {yearCrops.map((crop, idx) => {
          const profile = CROP_PROFILE[crop] || { season: 'Rabi', months: '—', family: 'Crop', baseYield: '—' };
          const health = [soilProgression.year1, soilProgression.year2, soilProgression.year3][idx];
          return (
            <div key={idx}>
              <div className="flex items-center gap-4">
                <div className="w-20 text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase">Year {idx + 1}</p>
                  <p className="text-2xl font-extrabold text-green-700 mt-1">{health}%</p>
                </div>
                <div className="flex-1">
                  <div
                    className="px-4 py-2 rounded-lg text-white font-bold"
                    style={{ backgroundColor: seasonColors[profile.season] || '#475569' }}
                  >
                    {crop} • {profile.season} ({profile.months})
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{profile.family} crop • {profile.baseYield}t/ha base yield</p>
                </div>
              </div>
              {idx < yearCrops.length - 1 && (
                <div className="flex justify-center mt-4">
                  <ArrowRight size={24} className="text-slate-300 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SustainabilityCard = ({ icon: Icon, label, value, unit, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-6 text-center border border-white/50`}>
    <Icon size={28} className="mx-auto mb-2 opacity-80" />
    <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">{label}</p>
    <p className="text-3xl font-extrabold text-slate-800">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{unit}</p>
  </div>
);

const FieldActionCalendar = ({ actions }) => {
  const grouped = Array.from({ length: 12 }, (_, i) => ({
    month: MONTH_NAMES[i],
    month_num: i + 1,
    year1: actions.filter((a) => a.year === 0 && a.month === i + 1),
    year2: actions.filter((a) => a.year === 1 && a.month === i + 1),
    year3: actions.filter((a) => a.year === 2 && a.month === i + 1),
  }));

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-x-auto">
      <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-600 mb-6">Field Action Calendar</h3>
      <div className="min-w-max">
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(12, minmax(100px, 1fr))' }}>
          {grouped.map((month) => (
            <div key={month.month} className="text-center">
              <p className="text-xs font-bold text-slate-500 mb-2">{month.month}</p>
              {[month.year1, month.year2, month.year3].map((acts, yearIdx) => (
                <div key={yearIdx} className="text-[10px] mb-1">
                  {acts.length > 0 ? (
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 font-bold">{acts[0].action}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NutrientChart = ({ nutrients }) => (
  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
    <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-600 mb-6">Nutrient Balance After 3-Year Cycle</h3>
    <div className="space-y-4">
      {['nitrogen', 'phosphorus', 'potassium'].map((nutrient) => (
        <div key={nutrient}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-slate-700 capitalize">{nutrient}</span>
            <span className="text-sm font-bold text-slate-600">{Math.round(nutrients[nutrient])}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-green-600 rounded-full transition-all"
              style={{ width: `${nutrients[nutrient]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RotationReport = ({ report }) => {
  const { topCrop, chain, soilHealth, actions, nutrients, impact, financial } = report;

  return (
    <div className="mt-10 space-y-6">
      <RotationTimeline
        previousCrop={report.previousCrop}
        top={topCrop}
        chain={chain}
        soilProgression={soilHealth}
      />

      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-600 mb-4">3-Year Sustainability Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SustainabilityCard icon={Zap} label="Fertilizer Reduction" value={impact.fertilizerReduction} unit="% synthetic N saved" bgColor="bg-green-50" />
          <SustainabilityCard icon={ShieldAlert} label="Disease Suppression" value={impact.diseaseReduction} unit="% pest pressure lower" bgColor="bg-blue-50" />
          <SustainabilityCard icon={Droplets} label="Water Efficiency" value={impact.waterEfficiency} unit="% better management" bgColor="bg-cyan-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-300 mb-6">Financial Impact: Rotation vs Monoculture</h3>
        <div className="grid grid-cols-2 gap-6 sm:gap-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">3-Yr Rotation Profit</p>
            <p className="text-4xl font-extrabold text-green-400">₹{(financial.rotation / 100000).toFixed(1)}L</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Monoculture Profit</p>
            <p className="text-4xl font-extrabold text-red-400">₹{(financial.monoculture / 100000).toFixed(1)}L</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Rotation Advantage</span>
            <span className="text-2xl font-extrabold text-green-400">+₹{(financial.benefit / 100000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      <NutrientChart nutrients={nutrients} />
      <FieldActionCalendar actions={actions} />

      <div className="bg-amber-50 rounded-2xl p-6 sm:p-8 border border-amber-200">
        <div className="flex gap-3 mb-4">
          <BookOpen size={20} className="text-amber-700 shrink-0" />
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-900">Key Actions for Success</h3>
        </div>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" /> Plan sowing dates per the calendar above; prepare field 2-3 weeks before.</li>
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" /> Reduce synthetic fertilizers by ~{impact.fertilizerReduction}% through legume nitrogen fixation.</li>
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" /> Monitor for pests in transition months (Month 3-5, 9-10); rotation will cut disease incidence by ~{impact.diseaseReduction}%.</li>
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" /> Expect soil health to stabilize at ~{soilHealth.year3}% by end of Year 3; continue cycle for long-term gains.</li>
        </ul>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-900 focus-visible:ring-4 focus-visible:ring-slate-300"
        >
          <Printer size={18} /> Print / Save 3-Year Rotation Plan
        </button>
      </div>
    </div>
  );
};

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */

export default function CropRotation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    previousCrop: '',
    N: '', P: '', K: '', ph: '', moistureLevel: '',
  });
  const [report, setReport] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCropChange = (val) => {
    setFormData((f) => ({ ...f, previousCrop: val }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setReport(null);

    try {
      const previousCrop = resolveCropName(formData.previousCrop);
      const chain = ROTATION_CHAINS[previousCrop] || ROTATION_CHAINS.DEFAULT;
      const topCrop = {
        crop: chain[0],
        market: MARKET_DATA[chain[0]] || { price: 3000 },
        profile: CROP_PROFILE[chain[0]],
      };

      const soilHealth = computeSoilProgression(previousCrop, topCrop, chain[1], chain[2]);
      const actions = buildActionCalendar(previousCrop, topCrop.crop, chain);
      const nutrients = computeNutrientBalance(previousCrop, topCrop.crop, chain);
      const impact = computeSustainabilityImpact(topCrop.crop, chain);
      const expectedYields = [topCrop.profile.baseYield * 0.85, topCrop.profile.baseYield, topCrop.profile.baseYield * 1.1];
      const financial = computeFinancialImpact(topCrop.crop, chain, expectedYields);

      setReport({ previousCrop, topCrop, chain, soilHealth, actions, nutrients, impact, financial });

      const token = localStorage.getItem('accessToken');
      if (token) {
        fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}api/rotation/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ inputs: formData, recommendation: chain[0] }),
        }).catch(() => {});
      }
    } catch (err) {
      setError('Could not generate rotation plan. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-16 sm:pt-20">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 px-4 py-16 sm:px-6 sm:py-24">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-300/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-300">
              <RotateCw size={14} /> Sustainable Agriculture
            </div>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight">
              Plan your fields for 3 years. Build wealth <span className="text-green-400">sustainably.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200">
              See exactly how crop rotation improves soil health, cuts fertilizer costs, and boosts profitability—mapped month by month for the next three seasons.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 mb-10">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Field Information</h2>
            <p className="text-slate-500 mt-1">Enter your current crop and soil test data to generate a 3-year rotation plan.</p>
          </div>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handlePredict}>
            <div className="sm:col-span-2">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-600">Previous / Current Crop</label>
              <div className="mt-2">
                <CropSearchInput
                  value={formData.previousCrop}
                  onChange={handleCropChange}
                  onSelect={handleCropChange}
                />
              </div>
            </div>

            {['N', 'P', 'K', 'ph', 'moistureLevel'].map((field) => (
              <div key={field}>
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-600">
                  {field === 'N' ? 'Nitrogen' : field === 'P' ? 'Phosphorus' : field === 'K' ? 'Potassium' : field === 'ph' ? 'Soil pH' : 'Moisture %'}
                </label>
                <input
                  type="number"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Value"
                  step="any"
                  required
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-green-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Generating plan...' : 'Generate 3-Year Rotation Plan'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {report && <RotationReport report={report} />}
      </main>
    </div>
  );
}