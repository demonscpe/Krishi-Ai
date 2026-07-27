import React, { useState } from 'react';
import bgHero from "../../assets/bgHero.png";
import AdvantagesDisadvantages from '../../components/models/AdvantagesDisadvantages';
import { ArrowRight, CheckCircle2, FlaskConical, Leaf, Sparkles } from 'lucide-react';

// High-resolution remote crop imagery. Keeping these as URLs avoids bundling
// large image files and lets the browser load only the images it needs.
const cropImages = [
    {
        src: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=90',
        alt: 'Green crop field at sunrise',
    },
    {
        src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=90',
        alt: 'Fresh crops growing in a field',
    },
    {
        src: 'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=90',
        alt: 'Agricultural field landscape',
    },
];

const soilFields = [
    { key: 'Nitrogen', label: 'Nitrogen', unit: 'kg/ha', placeholder: 'e.g. 90' },
    { key: 'Phosphorus', label: 'Phosphorus', unit: 'kg/ha', placeholder: 'e.g. 42' },
    { key: 'Potassium', label: 'Potassium', unit: 'kg/ha', placeholder: 'e.g. 38' },
    { key: 'Temperature', label: 'Temperature', unit: '°C', placeholder: 'e.g. 26' },
    { key: 'Humidity', label: 'Humidity', unit: '%', placeholder: 'e.g. 72' },
    { key: 'ph', label: 'Soil pH', unit: 'pH', placeholder: 'e.g. 6.5' },
    { key: 'Rainfall', label: 'Rainfall', unit: 'mm', placeholder: 'e.g. 180' },
];

const items = [
    { type: 'advantage', text: 'Helps farmers make data-driven decisions.' },
    { type: 'disadvantage', text: 'Requires accurate and up-to-date data for best results.' },
    { type: 'advantage', text: 'Increases crop yield by selecting the most suitable crops.' },
    { type: 'disadvantage', text: 'May involve initial costs for data collection and analysis tools.' },
    { type: 'advantage', text: 'Reduces the risk of crop failure by considering environmental factors.' },
    { type: 'disadvantage', text: 'Dependent on technology, which can be a barrier for some farmers.' },
    { type: 'advantage', text: 'Optimizes resource use like water and fertilizers.' },
    { type: 'disadvantage', text: 'May need ongoing support and updates to stay effective.' },
];

/* ======================================================================
   KNOWLEDGE BASE
   This is NOT the prediction itself — the prediction (crop name + ideally
   confidence + alternatives) comes from your ML model via the API call.
   These tables are the "explainability + recommendation" layer that turns
   a raw crop label into the rest of the report card. Swap any of these
   for a real API/model call later (comments mark exactly where).
   ====================================================================== */

// Ideal agronomic ranges per crop — used to generate the "Why this crop?"
// reasoning by comparing the farmer's actual inputs against them.
const CROP_IDEAL_RANGES = {
    Rice:      { temp: [20, 35], rainfall: [150, 300], ph: [5.5, 7.0], nitrogen: [60, 120] },
    Maize:     { temp: [18, 32], rainfall: [60, 180],  ph: [5.5, 7.5], nitrogen: [60, 140] },
    Cotton:    { temp: [21, 37], rainfall: [60, 110],  ph: [5.5, 8.0], nitrogen: [40, 100] },
    Sugarcane: { temp: [20, 38], rainfall: [150, 250], ph: [6.0, 7.5], nitrogen: [80, 150] },
    Wheat:     { temp: [10, 25], rainfall: [40, 100],  ph: [6.0, 7.5], nitrogen: [50, 100] },
    Chickpea:  { temp: [10, 30], rainfall: [40, 90],   ph: [6.0, 7.5], nitrogen: [10, 40]  },
    Mustard:   { temp: [10, 25], rainfall: [25, 75],   ph: [6.0, 7.5], nitrogen: [40, 80]  },
};

// Base yield (tons/hectare) under "ideal" conditions, adjusted by how
// closely actual inputs match the ideal range. Replace with a real
// regression model (e.g. CatBoost) endpoint when available — see
// computeExpectedYield() below for where the API call would slot in.
const CROP_BASE_YIELD = {
    Rice: 5.5, Maize: 6.0, Cotton: 2.2, Sugarcane: 70,
    Wheat: 3.5, Chickpea: 1.8, Mustard: 1.5,
};

// crop -> nitrogen-tier -> fertilizer plan
const FERTILIZER_RULES = {
    Rice: {
        low:    { primary: 'Urea',         schedule: ['Urea (60 kg/acre)', 'Urea (30 kg/acre) — top dress'] },
        medium: { primary: 'Urea + DAP',   schedule: ['Urea (50 kg/acre)', 'DAP (25 kg/acre)', 'Potash (10 kg/acre)'] },
        high:   { primary: 'DAP + Potash', schedule: ['DAP (30 kg/acre)', 'Potash (15 kg/acre)'] },
    },
    Maize: {
        low:    { primary: 'Urea + SSP',   schedule: ['Urea (50 kg/acre)', 'SSP (20 kg/acre)'] },
        medium: { primary: 'Urea + DAP',   schedule: ['Urea (40 kg/acre)', 'DAP (20 kg/acre)'] },
        high:   { primary: 'DAP + MOP',    schedule: ['DAP (25 kg/acre)', 'MOP (10 kg/acre)'] },
    },
    Cotton: {
        low:    { primary: 'Urea + DAP',   schedule: ['Urea (35 kg/acre)', 'DAP (20 kg/acre)'] },
        medium: { primary: 'DAP + Potash', schedule: ['DAP (25 kg/acre)', 'Potash (15 kg/acre)'] },
        high:   { primary: 'Potash + Micronutrients', schedule: ['Potash (20 kg/acre)', 'Zinc Sulphate (5 kg/acre)'] },
    },
    DEFAULT: {
        low:    { primary: 'Urea',         schedule: ['Urea (40 kg/acre)'] },
        medium: { primary: 'Urea + DAP',   schedule: ['Urea (30 kg/acre)', 'DAP (15 kg/acre)'] },
        high:   { primary: 'DAP + Potash', schedule: ['DAP (20 kg/acre)', 'Potash (10 kg/acre)'] },
    },
};

const WATER_REQUIREMENT = {
    Rice:      { level: 'High',   mm: '1200 - 1500 mm/season', frequency: 'Every 3-5 days' },
    Maize:     { level: 'Medium', mm: '500 - 800 mm/season',   frequency: 'Every 7-10 days' },
    Cotton:    { level: 'Medium', mm: '700 - 1300 mm/season',  frequency: 'Every 10-12 days' },
    Sugarcane: { level: 'High',   mm: '1500 - 2500 mm/season', frequency: 'Every 5-7 days' },
    Wheat:     { level: 'Low',    mm: '400 - 650 mm/season',   frequency: 'Every 12-15 days' },
    DEFAULT:   { level: 'Medium', mm: '600 - 1000 mm/season',  frequency: 'Every 7-10 days' },
};

// Placeholder market prices (₹/quintal). In production, replace
// getMarketPrice() below with a real Agmarknet API call.
const MARKET_PRICE = {
    Rice: 2600, Maize: 2200, Cotton: 7400, Sugarcane: 340,
    Wheat: 2275, Chickpea: 5440, Mustard: 5650,
};

const ROTATION_SUGGESTIONS = {
    Rice: ['Chickpea', 'Mustard', 'Wheat'],
    Maize: ['Mustard', 'Chickpea', 'Wheat'],
    Cotton: ['Wheat', 'Chickpea', 'Mustard'],
    DEFAULT: ['Wheat', 'Chickpea', 'Mustard'],
};

/* ======================================================================
   DERIVATION LOGIC — turns (crop, confidence, raw inputs) into the
   full report. None of the numbers below are fixed sample values;
   every function reads the farmer's actual form inputs.
   ====================================================================== */

function inRange(value, [min, max]) {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return null;
    return v >= min && v <= max;
}

// Builds the "Why this crop?" checklist by comparing actual inputs
// against the predicted crop's ideal agronomic range.
function computeReasons(crop, formData) {
    const ranges = CROP_IDEAL_RANGES[crop];
    const reasons = [];

    if (!ranges) {
        return [{ label: 'Suitability', value: 'Within accepted model parameters', ok: true }];
    }

    const checks = [
        { key: 'Temperature', field: 'Temperature', unit: '°C', range: ranges.temp },
        { key: 'Rainfall',    field: 'Rainfall',    unit: 'mm', range: ranges.rainfall },
        { key: 'pH',          field: 'ph',          unit: '',   range: ranges.ph },
        { key: 'Nitrogen',    field: 'Nitrogen',    unit: 'kg/ha', range: ranges.nitrogen },
    ];

    checks.forEach(({ key, field, unit, range }) => {
        const raw = formData[field];
        const ok = inRange(raw, range);
        if (ok === null) return; // skip if field wasn't filled in
        reasons.push({
            label: key,
            value: `${raw}${unit}`,
            ok,
            idealRange: `${range[0]}–${range[1]}${unit}`,
        });
    });

    return reasons;
}

// Heuristic yield estimate: base yield scaled by how many of the
// ideal-range checks passed. Swap this for a real model call, e.g.:
//   const res = await fetch(`${API_BASE}/yield_predict`, { ... });
function computeExpectedYield(crop, reasons) {
    const base = CROP_BASE_YIELD[crop] ?? 3.0;
    if (!reasons.length) return base.toFixed(1);
    const passed = reasons.filter(r => r.ok).length;
    const ratio = passed / reasons.length;
    // ideal conditions -> ~full base yield, poor conditions -> as low as ~55%
    const adjusted = base * (0.55 + 0.45 * ratio);
    return adjusted.toFixed(1);
}

function getNitrogenTier(nitrogenValue) {
    const n = parseFloat(nitrogenValue);
    if (Number.isNaN(n)) return 'medium';
    if (n < 40) return 'low';
    if (n <= 90) return 'medium';
    return 'high';
}

function computeFertilizer(crop, formData) {
    const tier = getNitrogenTier(formData.Nitrogen);
    const table = FERTILIZER_RULES[crop] ?? FERTILIZER_RULES.DEFAULT;
    return { tier, ...table[tier] };
}

function getWaterRequirement(crop) {
    return WATER_REQUIREMENT[crop] ?? WATER_REQUIREMENT.DEFAULT;
}

// Replace with a live Agmarknet (or similar mandi price) API call:
//   const res = await fetch(`${API_BASE}/market_price?crop=${crop}`);
function getMarketPrice(crop) {
    return MARKET_PRICE[crop] ?? null;
}

function computeRevenue(crop, yieldTons) {
    const pricePerQuintal = getMarketPrice(crop);
    if (!pricePerQuintal) return null;
    const quintals = parseFloat(yieldTons) * 10; // 1 ton = 10 quintals
    return Math.round(quintals * pricePerQuintal);
}

// Risk level is rule-based on model confidence. If your API also exposes
// disease/weather risk probabilities, blend them in here instead.
function computeRiskLevel(confidence) {
    if (confidence == null) return { level: 'Unknown', successProb: null };
    if (confidence > 95) return { level: 'Low', successProb: confidence };
    if (confidence > 80) return { level: 'Medium', successProb: confidence };
    return { level: 'High', successProb: confidence };
}

function getRotationSuggestions(crop) {
    return ROTATION_SUGGESTIONS[crop] ?? ROTATION_SUGGESTIONS.DEFAULT;
}

/* ======================================================================
   REPORT CARD — purely a presentation layer over the derived data above
   ====================================================================== */

const SectionHeader = ({ emoji, title }) => (
    <div className="flex items-center gap-2.5 mb-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-green-50 text-base">{emoji}</span>
        <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-[0.14em]">{title}</h4>
    </div>
);

const ReportCard = ({ report }) => {
    const {
        crop, confidence, alternatives, reasons,
        fertilizer, water, expectedYield, marketPrice,
        revenue, risk, rotation, aiInsight,
    } = report;

    const riskColor = risk.level === 'Low' ? 'text-green-600 bg-green-50 border-green-200'
        : risk.level === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-red-600 bg-red-50 border-red-200';

    return (
        <div className="mt-8 sm:mt-10 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            {/* Headline */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-600 px-5 py-8 sm:px-8 sm:py-10 text-center text-white">
                <p className="text-green-100 font-bold uppercase tracking-[0.16em] text-[11px] sm:text-xs mb-2">Recommended Crop</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight break-words">{crop}</h2>
                {confidence != null && (
                    <p className="mt-2 text-green-100">Confidence: <span className="font-bold text-white">{confidence.toFixed(1)}%</span></p>
                )}
                {alternatives && alternatives.length > 0 && (
                    <p className="mt-4 text-sm text-green-100">
                        Alternatives: {alternatives.map(a => `${a.crop} (${a.confidence.toFixed(1)}%)`).join(' · ')}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8 p-5 sm:p-8">
                {/* Why this crop */}
                <div>
                    <SectionHeader emoji="🧠" title="Why this crop?" />
                    <ul className="space-y-2">
                        {reasons.map((r) => (
                            <li key={r.label} className="flex flex-col gap-1 border-b border-slate-100 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                <span className="font-medium text-slate-600">{r.label}</span>
                                <span className={`break-words sm:text-right ${r.ok ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}`}>
                                    {r.value} {r.ok ? '✓' : '✗'}
                                    {r.idealRange && <span className="text-gray-400 font-normal ml-1">(ideal {r.idealRange})</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Yield + Market */}
                <div>
                    <SectionHeader emoji="📈" title="Yield & Market" />
                    <div className="space-y-3 text-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                            <span className="text-slate-600">Expected Yield</span>
                            <span className="font-bold text-slate-800 sm:text-right">{expectedYield} tons/hectare</span>
                        </div>
                        {marketPrice && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Market Price</span>
                                <span className="font-bold text-gray-800">₹{marketPrice.toLocaleString('en-IN')}/quintal</span>
                            </div>
                        )}
                        {revenue && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estimated Revenue</span>
                                <span className="font-bold text-gray-800">₹{revenue.toLocaleString('en-IN')}/hectare</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fertilizer */}
                <div>
                    <SectionHeader emoji="🌿" title="Fertilizer Recommendation" />
                    <p className="text-sm text-slate-600 mb-2">Primary: <span className="font-bold text-slate-800">{fertilizer.primary}</span></p>
                    <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5 leading-relaxed">
                        {fertilizer.schedule.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                </div>

                {/* Water */}
                <div>
                    <SectionHeader emoji="💧" title="Water Requirement" />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Level</span><span className="font-bold text-gray-800">{water.level}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Estimated Need</span><span className="font-bold text-gray-800">{water.mm}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Irrigation Frequency</span><span className="font-bold text-gray-800">{water.frequency}</span></div>
                    </div>
                </div>

                {/* Risk */}
                <div>
                    <SectionHeader emoji="⚠️" title="Risk Assessment" />
                    <div className={`rounded-xl border px-4 py-3 text-sm font-semibold leading-relaxed ${riskColor}`}>
                        Overall Risk: {risk.level}
                        {risk.successProb != null && (
                            <span className="block text-xs font-normal mt-1 opacity-80">Model success probability: {risk.successProb.toFixed(1)}%</span>
                        )}
                    </div>
                </div>

                {/* AI Insight */}
                {aiInsight && (
                    <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 sm:p-6">
                        <SectionHeader emoji="🤖" title="AI Agronomic Insight" />
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiInsight}</p>
                    </div>
                )}

                {/* Rotation */}
                <div>
                    <SectionHeader emoji="🔄" title="Next Season Rotation" />
                    <div className="flex flex-wrap gap-2">
                        {rotation.map((c) => (
                            <span key={c} className="px-3 py-1.5 bg-slate-100 text-gray-700 text-sm font-medium rounded-full">{c}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */

const CropRecommendation = () => {
    const [isLoading, setIsloading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ category: 'field_crops', Nitrogen: '', Phosphorus: '', Potassium: '', Temperature: '', Humidity: '', ph: '', Rainfall: '' });
    const [report, setReport] = useState(null);

    // No initial spinner needed — Spinner.jsx is a full-screen preloader

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePredictClick = async (e) => {
        e.preventDefault();
        setError(null);
        setIsloading(true);
        setReport(null);

        try {
            const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
            const url = `${base}/api/croprecommendation/predict`;

            const N  = parseFloat(formData.Nitrogen);
            const P  = parseFloat(formData.Phosphorus);
            const K  = parseFloat(formData.Potassium);
            const T  = parseFloat(formData.Temperature);
            const H  = parseFloat(formData.Humidity);
            const ph = parseFloat(formData.ph);
            const R  = parseFloat(formData.Rainfall);

            // Validate all fields are numbers and within API schema bounds
            if ([N, P, K, T, H, ph, R].some(isNaN)) {
                setError('Please fill in all soil parameters before submitting.');
                setIsloading(false);
                return;
            }
            if (T < -50 || T > 60)  { setError('Temperature must be between -50 and 60 °C.'); setIsloading(false); return; }
            if (H < 0  || H > 100)  { setError('Humidity must be between 0 and 100 %.'); setIsloading(false); return; }
            if (ph < 0 || ph > 14)  { setError('Soil pH must be between 0 and 14.'); setIsloading(false); return; }

            const payload = {
                category: formData.category,
                Nitrogen: N,
                Phosphorus: P,
                Potassium: K,
                Temperature: T,
                Humidity: H,
                ph: ph,
                Rainfall: R,
            };

            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || `Server error (${res.status})`);
            }

            // FastAPI returns: { Prediction, Confidence, Alternatives, AIInsight, Category, Source }
            const crop = data?.Prediction;
            if (!crop) {
                throw new Error(`Prediction not returned by server. Response keys: ${Object.keys(data || {}).join(', ')}`);
            }

            const confidence = typeof data?.Confidence === 'number' ? data.Confidence : null;
            const alternatives = Array.isArray(data?.Alternatives) ? data.Alternatives : [];
            const aiInsight = data?.AIInsight || null;


            const reasons = computeReasons(crop, formData);
            const expectedYield = computeExpectedYield(crop, reasons);
            const fertilizer = computeFertilizer(crop, formData);
            const water = getWaterRequirement(crop);
            const marketPrice = getMarketPrice(crop);
            const revenue = computeRevenue(crop, expectedYield);
            const risk = computeRiskLevel(confidence);
            const rotation = getRotationSuggestions(crop);

            setReport({
                crop, confidence, alternatives, reasons,
                fertilizer, water, expectedYield, marketPrice,
                revenue, risk, rotation, aiInsight,
            });

            // Save to backend history (only if user is logged in)
            const token = localStorage.getItem('accessToken');
            if (token) {
                fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}api/crop/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ inputs: formData, prediction: crop, confidence, alternatives, aiInsight }),
                }).catch(() => {}); // silent fail — history is optional
            }
        } catch (err) {
            setError("Couldn't reach the prediction service. Please try again.");
        } finally {
            setIsloading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
                    <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
                        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
                        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
                        <div className="absolute -bottom-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
                        <div className="mx-auto max-w-7xl">
                            <div className="max-w-3xl">
                                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
                                    <Sparkles size={14} className="text-lime-300" /> AI crop intelligence
                                </div>
                                <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    Grow with confidence, backed by your soil data.
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
                                    Receive a crop recommendation tailored to your soil nutrients and local growing conditions.
                                </p>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-emerald-100">
                                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Soil-led insights</span>
                                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Clear next steps</span>
                                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Yield-aware planning</span>
                            </div>
                        </div>
                    </section>

                    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
                        <div className="-mt-7 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1.25fr_0.75fr]">
                            <section className="p-5 sm:p-8 lg:p-10">
                                <div className="mb-8 flex items-start gap-4">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FlaskConical size={22} /></div>
                                    <div>
                                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-600">Field analysis</p>
                                        <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Enter your soil parameters</h2>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-500">Use your latest soil-test values for the most reliable result.</p>
                                    </div>
                                </div>
                                <form className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6" onSubmit={handlePredictClick}>
                                    <div className="sm:col-span-2 space-y-2 mb-2">
                                        <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">What are you growing?</label>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {[
                                                { value: 'field_crops', label: '🌾 Field Crops', desc: 'Rice, Wheat, Maize...' },
                                                { value: 'vegetables',  label: '🥦 Vegetables',  desc: 'Tomato, Potato...' },
                                                { value: 'flowers',     label: '🌸 Flowers',     desc: 'Rose, Tulip...' },
                                            ].map(opt => (
                                                <button key={opt.value} type="button"
                                                    onClick={() => setFormData({ ...formData, category: opt.value })}
                                                    className={`rounded-xl border-2 px-3 py-3 text-center transition ${formData.category === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
                                                    <div className="text-base font-semibold">{opt.label}</div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {soilFields.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <label htmlFor={field.key} className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">{field.label}</label>
                                                <span className="text-xs font-medium text-slate-400">{field.unit}</span>
                                            </div>
                                            <input
                                                id={field.key}
                                                type="number"
                                                step="any"
                                                inputMode="decimal"
                                                name={field.key}
                                                value={formData[field.key]}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    ))}
                                    <div className="pt-2 sm:col-span-2">
                                        <button type="submit" disabled={isLoading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base">
                                            {isLoading ? 'Analyzing your field data...' : 'Generate crop recommendation'}
                                            {!isLoading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                                        </button>
                                        <p className="mt-3 text-center text-xs text-slate-400">Your values are used only to prepare this recommendation.</p>
                                    </div>
                                </form>

                                    {error && (
                                        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                            {error}
                                        </div>
                                    )}
                            </section>

                            <aside className="relative overflow-hidden bg-emerald-900 p-6 text-white sm:p-8 lg:p-10">
                                <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/35 to-emerald-950/85" />
                                <img src={cropImages[0].src} className="absolute inset-0 h-full w-full object-cover opacity-30" alt="" aria-hidden="true" />
                                <div className="relative flex h-full flex-col">
                                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50"><Leaf size={14} className="text-lime-300" /> Precision farming</div>
                                    <div className="my-10 grid grid-cols-2 gap-3">
                                        <img src={cropImages[1].src} className="aspect-square w-full rounded-2xl border-2 border-white/60 object-cover shadow-xl" alt={cropImages[1].alt} loading="lazy" />
                                        <img src={cropImages[2].src} className="mt-8 aspect-square w-full rounded-2xl border-2 border-white/60 object-cover shadow-xl" alt={cropImages[2].alt} loading="lazy" />
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">Better inputs, better decisions</p>
                                        <h3 className="mt-3 text-2xl font-extrabold leading-tight">Turn soil values into a practical crop plan.</h3>
                                        <p className="mt-3 text-sm leading-relaxed text-emerald-50/80">We assess crop suitability, expected yield, fertilizer needs and water requirements in one report.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>

                    {/* Full Report Card */}
                        {report && <ReportCard report={report} />}
                    </main>

                    {/* Bottom Info Section */}
                    <div className="bg-white py-12 sm:py-16">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6">
                            <div className="text-center mb-10">
                              <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Insights</p>
                              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">Analysis Overview</h2>
                              <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
                            </div>
                            <AdvantagesDisadvantages items={items} />
                        </div>
                    </div>
                </div>
    );
};

export default CropRecommendation;
