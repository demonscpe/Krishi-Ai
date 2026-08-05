import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import bgHero from "../../assets/bgHero.png";
import AdvantagesDisadvantages from "../../components/models/AdvantagesDisadvantages";
import {
  ArrowLeft, CheckCircle2, Leaf, Sparkles,
  Shield, Sprout, Loader2, AlertCircle
} from 'lucide-react';

const items = [
    { type: 'advantage', text: 'Enhances crop productivity by informing soil management decisions.' },
    { type: 'disadvantage', text: 'Requires access to technology and data for accurate predictions.' },
    { type: 'advantage', text: 'Facilitates efficient resource allocation and planning.' },
    { type: 'disadvantage', text: 'Initial costs for implementing soil testing and modeling can be high.' },
    { type: 'advantage', text: 'Enables early detection of nutrient deficiencies and soil issues.' },
    { type: 'disadvantage', text: 'Predictions may vary based on environmental changes and model accuracy.' },
    { type: 'advantage', text: 'Supports better water management and conservation efforts.' },
    { type: 'disadvantage', text: 'Complexity of soil science may lead to misinterpretations of data.' },
];

/* ======================================================================
   SOIL QUALITY FIELD CONFIG
   ====================================================================== */
const soilFields = [
    { key: 'N', label: 'Nitrogen', unit: 'kg/ha', placeholder: '0 to 400' },
    { key: 'P', label: 'Phosphorus', unit: 'kg/ha', placeholder: '0 to 150' },
    { key: 'K', label: 'Potassium', unit: 'kg/ha', placeholder: '0 to 900' },
    { key: 'pH', label: 'pH Level', unit: '', placeholder: '1 to 14' },
    { key: 'EC', label: 'Electrical Conductivity', unit: 'dS/m', placeholder: '0 to 1' },
    { key: 'OC', label: 'Organic Carbon', unit: '%', placeholder: '0 to 2' },
    { key: 'S', label: 'Sulphur', unit: 'ppm', placeholder: '0 to 30' },
    { key: 'Zn', label: 'Zinc', unit: 'ppm', placeholder: '0 to 1' },
    { key: 'Fe', label: 'Iron', unit: 'ppm', placeholder: '0 to 50' },
    { key: 'Cu', label: 'Copper', unit: 'ppm', placeholder: '0 to 3' },
    { key: 'Mn', label: 'Manganese', unit: 'ppm', placeholder: '0 to 30' },
    { key: 'B', label: 'Boron', unit: 'ppm', placeholder: '0 to 3' },
];

/* ======================================================================
   CROP RECOMMENDATION FIELD CONFIG + KNOWLEDGE BASE
   ====================================================================== */
const cropFields = [
    { key: 'Nitrogen', label: 'Nitrogen', unit: 'kg/ha', placeholder: 'e.g. 90' },
    { key: 'Phosphorus', label: 'Phosphorus', unit: 'kg/ha', placeholder: 'e.g. 42' },
    { key: 'Potassium', label: 'Potassium', unit: 'kg/ha', placeholder: 'e.g. 38' },
    { key: 'Temperature', label: 'Temperature', unit: '°C', placeholder: 'e.g. 26' },
    { key: 'Humidity', label: 'Humidity', unit: '%', placeholder: 'e.g. 72' },
    { key: 'ph', label: 'Soil pH', unit: 'pH', placeholder: 'e.g. 6.5' },
    { key: 'Rainfall', label: 'Rainfall', unit: 'mm', placeholder: 'e.g. 180' },
];

const CROP_IDEAL_RANGES = {
    Rice:      { temp: [20, 35], rainfall: [150, 300], ph: [5.5, 7.0], nitrogen: [60, 120] },
    Maize:     { temp: [18, 32], rainfall: [60, 180],  ph: [5.5, 7.5], nitrogen: [60, 140] },
    Cotton:    { temp: [21, 37], rainfall: [60, 110],  ph: [5.5, 8.0], nitrogen: [40, 100] },
    Sugarcane: { temp: [20, 38], rainfall: [150, 250], ph: [6.0, 7.5], nitrogen: [80, 150] },
    Wheat:     { temp: [10, 25], rainfall: [40, 100],  ph: [6.0, 7.5], nitrogen: [50, 100] },
    Chickpea:  { temp: [10, 30], rainfall: [40, 90],   ph: [6.0, 7.5], nitrogen: [10, 40]  },
    Mustard:   { temp: [10, 25], rainfall: [25, 75],   ph: [6.0, 7.5], nitrogen: [40, 80]  },
};

const CROP_BASE_YIELD = {
    Rice: 5.5, Maize: 6.0, Cotton: 2.2, Sugarcane: 70,
    Wheat: 3.5, Chickpea: 1.8, Mustard: 1.5,
};

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
   DERIVATION LOGIC
   ====================================================================== */
function inRange(value, [min, max]) {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return null;
    return v >= min && v <= max;
}

function computeReasons(crop, formData) {
    const ranges = CROP_IDEAL_RANGES[crop];
    if (!ranges) {
        return [{ label: 'Suitability', value: 'Within accepted model parameters', ok: true }];
    }
    const checks = [
        { key: 'Temperature', field: 'Temperature', unit: '°C', range: ranges.temp },
        { key: 'Rainfall',    field: 'Rainfall',    unit: 'mm', range: ranges.rainfall },
        { key: 'pH',          field: 'ph',          unit: '',   range: ranges.ph },
        { key: 'Nitrogen',    field: 'Nitrogen',    unit: 'kg/ha', range: ranges.nitrogen },
    ];
    const reasons = [];
    checks.forEach(({ key, field, unit, range }) => {
        const raw = formData[field];
        const ok = inRange(raw, range);
        if (ok === null) return;
        reasons.push({
            label: key, value: `${raw}${unit}`, ok,
            idealRange: `${range[0]}–${range[1]}${unit}`,
        });
    });
    return reasons;
}

function computeExpectedYield(crop, reasons) {
    const base = CROP_BASE_YIELD[crop] ?? 3.0;
    if (!reasons.length) return base.toFixed(1);
    const passed = reasons.filter(r => r.ok).length;
    const ratio = passed / reasons.length;
    return (base * (0.55 + 0.45 * ratio)).toFixed(1);
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

function getMarketPrice(crop) {
    return MARKET_PRICE[crop] ?? null;
}

function computeRevenue(crop, yieldTons) {
    const pricePerQuintal = getMarketPrice(crop);
    if (!pricePerQuintal) return null;
    const quintals = parseFloat(yieldTons) * 10;
    return Math.round(quintals * pricePerQuintal);
}

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
   QUALITY RESULT PRESENTATION
   ====================================================================== */
const QUALITY_META = {
    Good: {
        emoji: '🌿', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
        message: 'Your soil is healthy and well-balanced. Nutrient levels are within ideal ranges for productive farming.',
        tips: ['Maintain current nutrient levels with regular balanced fertilization.', 'Keep up routine soil testing every 1-2 seasons.', 'Mulch and crop rotation will preserve organic matter.'],
    },
    Moderate: {
        emoji: '⚖️', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
        message: 'Your soil is workable but some parameters need attention. Correct the imbalances to unlock better yields.',
        tips: ['Apply a balanced NPK fertilizer based on a fresh soil test.', 'Use lime or gypsum to adjust pH where required.', 'Add compost or green manure to lift organic carbon.'],
    },
    Poor: {
        emoji: '🚨', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
        message: 'Your soil needs immediate care. Several key parameters are outside the ideal range for healthy crop growth.',
        tips: ['Conduct a detailed soil test to pinpoint every deficiency.', 'Follow a targeted nutrient restoration plan before sowing.', 'Incorporate organic matter and practice soil conservation.'],
    },
};

const QualityResultCard = ({ quality }) => {
    const meta = QUALITY_META[quality] || QUALITY_META.Moderate;
    return (
        <div className={`mt-6 overflow-hidden rounded-2xl border ${meta.border} bg-white shadow-xl`}>
            <div className={`${meta.bg} px-6 py-8 text-center`}>
                <div className="text-5xl">{meta.emoji}</div>
                <p className={`mt-3 text-xs font-bold uppercase tracking-[0.16em] ${meta.color}`}>Predicted soil quality</p>
                <h3 className={`mt-1 text-4xl font-black ${meta.color}`}>{quality}</h3>
            </div>
            <div className="px-6 py-5">
                <p className="text-sm leading-relaxed text-slate-600">{meta.message}</p>
                <div className="mt-4 space-y-2">
                    {meta.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-500" /> {tip}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ======================================================================
   CROP REPORT CARD
   ====================================================================== */
const SectionHeader = ({ emoji, title }) => (
    <div className="flex items-center gap-2.5 mb-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-green-50 text-base">{emoji}</span>
        <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-[0.14em]">{title}</h4>
    </div>
);

const CropReportCard = ({ report }) => {
    const { crop, confidence, alternatives, reasons, fertilizer, water, expectedYield, marketPrice, revenue, risk, rotation, aiInsight } = report;
    const riskColor = risk.level === 'Low' ? 'text-green-600 bg-green-50 border-green-200'
        : risk.level === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-red-600 bg-red-50 border-red-200';

    return (
        <div className="mt-8 sm:mt-10 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
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

                <div>
                    <SectionHeader emoji="🌿" title="Fertilizer Recommendation" />
                    <p className="text-sm text-slate-600 mb-2">Primary: <span className="font-bold text-slate-800">{fertilizer.primary}</span></p>
                    <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5 leading-relaxed">
                        {fertilizer.schedule.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                </div>

                <div>
                    <SectionHeader emoji="💧" title="Water Requirement" />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Level</span><span className="font-bold text-gray-800">{water.level}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Estimated Need</span><span className="font-bold text-gray-800">{water.mm}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Irrigation Frequency</span><span className="font-bold text-gray-800">{water.frequency}</span></div>
                    </div>
                </div>

                <div>
                    <SectionHeader emoji="⚠️" title="Risk Assessment" />
                    <div className={`rounded-xl border px-4 py-3 text-sm font-semibold leading-relaxed ${riskColor}`}>
                        Overall Risk: {risk.level}
                        {risk.successProb != null && (
                            <span className="block text-xs font-normal mt-1 opacity-80">Model success probability: {risk.successProb.toFixed(1)}%</span>
                        )}
                    </div>
                </div>

                {aiInsight && (
                    <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 sm:p-6">
                        <SectionHeader emoji="🤖" title="AI Agronomic Insight" />
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiInsight}</p>
                    </div>
                )}

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
   SOIL TESTING CENTERS (Mapbox)
   ====================================================================== */
const soilTestingCenters = [
    { name: "Visakhapatnam Soil Testing Laboratory", coordinates: [83.3182, 17.6868], contact: "0891-2700400", services: "Soil Testing, Nutrient Analysis" },
    { name: "Vijayawada Soil Testing Center", coordinates: [80.6456, 16.5062], contact: "0866-2573401", services: "Soil Testing, pH Testing" },
    { name: "Guntur Soil Testing Laboratory", coordinates: [80.4545, 16.3064], contact: "0863-2225555", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Itanagar Soil Testing Laboratory", coordinates: [93.6162, 27.1027], contact: "0360-2212437", services: "Soil Testing, Nutrient Analysis" },
    { name: "Assam Agricultural University Soil Testing Lab", coordinates: [91.5868, 26.1445], contact: "0361-2360512", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Bihar Soil Testing Laboratory", coordinates: [85.324, 25.5948], contact: "0612-2540994", services: "Soil Testing, Nutrient Analysis" },
    { name: "Bhagalpur Soil Testing Center", coordinates: [87.0054, 25.2500], contact: "0641-2403903", services: "Soil Testing, pH Testing" },
    { name: "Raipur Soil Testing Laboratory", coordinates: [81.6337, 21.2514], contact: "0771-2239208", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Goa Soil Testing Laboratory", coordinates: [73.8143, 15.4909], contact: "0832-2422051", services: "Soil Testing, Nutrient Analysis" },
    { name: "Gujarat Agricultural University Soil Testing Laboratory", coordinates: [72.5714, 23.0225], contact: "079-26301347", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Surat Soil Testing Center", coordinates: [72.8311, 21.1702], contact: "0261-2412170", services: "Soil Testing, Micro Nutrient Analysis" },
    { name: "Rajkot Soil Testing Laboratory", coordinates: [70.7483, 22.3039], contact: "0281-2463073", services: "Soil Testing, pH Testing" },
    { name: "Chandigarh Soil Testing Laboratory", coordinates: [76.8324, 30.7333], contact: "0172-2742002", services: "Soil Testing, Nutrient Analysis" },
    { name: "Hisar Soil Testing Center", coordinates: [75.5705, 29.1498], contact: "01662-263588", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Ranchi Soil Testing Laboratory", coordinates: [85.3380, 23.3441], contact: "0651-2481582", services: "Soil Testing, Micro Nutrient Analysis" },
    { name: "Karnataka Soil Testing Laboratory", coordinates: [77.5946, 12.9716], contact: "080-23346053", services: "Soil Testing, Nutrient Analysis" },
    { name: "Mysore Soil Testing Laboratory", coordinates: [76.6383, 12.2958], contact: "0821-2412990", services: "Soil Testing, pH Testing" },
    { name: "Hubli Soil Testing Laboratory", coordinates: [75.1299, 15.3644], contact: "0836-2264468", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Kerala Agricultural University Soil Testing Lab", coordinates: [76.9493, 8.5241], contact: "0471-2301605", services: "Soil Testing, Nutrient Analysis" },
    { name: "Kochi Soil Testing Laboratory", coordinates: [76.2673, 9.9816], contact: "0484-2368447", services: "Soil Testing, pH Testing" },
    { name: "Bhopal Soil Testing Laboratory", coordinates: [77.4126, 23.2599], contact: "0755-2451640", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Indore Soil Testing Center", coordinates: [75.8760, 22.7196], contact: "0731-2438020", services: "Soil Testing, Micro Nutrient Analysis" },
    { name: "Mumbai Soil Testing Center", coordinates: [72.8777, 19.0760], contact: "022-22164278", services: "Soil Testing, Organic Matter Analysis" },
    { name: "Pune Soil Testing Laboratory", coordinates: [73.8567, 18.5204], contact: "020-25512023", services: "Soil Testing, Micro Nutrient Analysis" },
    { name: "Imphal Soil Testing Laboratory", coordinates: [93.6151, 24.8170], contact: "0385-2454466", services: "Soil Testing, Nutrient Analysis" },
    { name: "Shillong Soil Testing Laboratory", coordinates: [91.5822, 25.5788], contact: "0364-2225714", services: "Soil Testing, pH Testing" },
    { name: "Aizawl Soil Testing Laboratory", coordinates: [92.7274, 23.1645], contact: "0389-2315554", services: "Soil Testing, Nutrient Analysis" },
    { name: "Kohima Soil Testing Laboratory", coordinates: [94.1126, 25.6742], contact: "0370-2270678", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Odisha Soil Testing Laboratory", coordinates: [85.8314, 20.2961], contact: "0674-2391653", services: "Soil Testing, Nutrient Analysis" },
    { name: "Cuttack Soil Testing Center", coordinates: [86.9987, 20.4625], contact: "0671-2410418", services: "Soil Testing, pH Testing" },
    { name: "Amritsar Soil Testing Laboratory", coordinates: [74.9438, 31.6340], contact: "0183-2251236", services: "Soil Testing, Nutrient Analysis" },
    { name: "Ludhiana Soil Testing Center", coordinates: [75.7804, 30.9009], contact: "0161-2405590", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Jaipur Soil Testing Laboratory", coordinates: [75.7885, 26.9124], contact: "0141-2202731", services: "Soil Testing, Nutrient Analysis" },
    { name: "Jodhpur Soil Testing Center", coordinates: [73.0243, 26.2389], contact: "0291-2632300", services: "Soil Testing, pH Testing" },
    { name: "Chennai Soil Testing Laboratory", coordinates: [80.2785, 13.0827], contact: "044-25384111", services: "Soil Testing, Organic Matter Analysis" },
    { name: "Coimbatore Soil Testing Laboratory", coordinates: [77.0073, 11.0168], contact: "0422-2555514", services: "Soil Testing, Micro Nutrient Analysis" },
    { name: "Hyderabad Soil Testing Laboratory", coordinates: [78.4744, 17.3850], contact: "040-24511544", services: "Soil Testing, Nutrient Analysis" },
    { name: "Warangal Soil Testing Center", coordinates: [79.5941, 17.9784], contact: "0870-2564892", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Agartala Soil Testing Laboratory", coordinates: [91.2863, 23.8315], contact: "0381-2321028", services: "Soil Testing, Nutrient Analysis" },
    { name: "Lucknow Soil Testing Laboratory", coordinates: [80.9462, 26.8468], contact: "0522-2622100", services: "Soil Testing, pH Testing" },
    { name: "Agra Soil Testing Center", coordinates: [78.0081, 27.1767], contact: "0562-2288893", services: "Soil Testing, Fertilizer Recommendation" },
    { name: "Dehradun Soil Testing Laboratory", coordinates: [78.0480, 30.3165], contact: "0135-2652447", services: "Soil Testing, Nutrient Analysis" },
    { name: "Kolkata Soil Testing Laboratory", coordinates: [88.3639, 22.5726], contact: "033-22412894", services: "Soil Testing, Organic Matter Analysis" },
    { name: "Darjeeling Soil Testing Center", coordinates: [88.2622, 27.0369], contact: "0354-2255000", services: "Soil Testing, pH Testing" },
    { name: "Srinagar Soil Testing Laboratory", coordinates: [74.7794, 34.0837], contact: "0194-2452715", services: "Soil Testing, Nutrient Analysis" },
    { name: "Leh Soil Testing Laboratory", coordinates: [77.5828, 34.1526], contact: "01982-252234", services: "Soil Testing, Fertilizer Recommendation" },
];

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */
const SoilQuality = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('quality');

    const [soilForm, setSoilForm] = useState({ N: '', P: '', K: '', pH: '', EC: '', OC: '', S: '', Zn: '', Fe: '', Cu: '', Mn: '', B: '' });
    const [soilResult, setSoilResult] = useState('');
    const [showSoilResult, setShowSoilResult] = useState(false);
    const [soilLoading, setSoilLoading] = useState(false);
    const [soilError, setSoilError] = useState(null);

    const [cropForm, setCropForm] = useState({ category: 'field_crops', Nitrogen: '', Phosphorus: '', Potassium: '', Temperature: '', Humidity: '', ph: '', Rainfall: '' });
    const [cropLoading, setCropLoading] = useState(false);
    const [cropError, setCropError] = useState(null);
    const [report, setReport] = useState(null);

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoiYW5hbmRoYSIsImEiOiJjbTIwN29haWEwYzVrMmpzZ25yeTF4MmN4In0.3fHnwKMxxXNy9pM-Vcn9gw';

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [78.9629, 20.5937],
            zoom: 5,
        });

        soilTestingCenters.forEach(center => {
            new mapboxgl.Marker({ color: '#059669' })
                .setLngLat(center.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
                    `<strong>${center.name}</strong><br/>Contact: ${center.contact}<br/>Services: ${center.services}`
                ))
                .addTo(map);
        });

        return () => map.remove();
    }, []);

    const handleSoilChange = (event) => {
        const { name, value } = event.target;
        setSoilForm(prev => ({ ...prev, [name]: value }));
        setSoilError(null);
        setShowSoilResult(false);
    };

    const handleCropChange = (e) => {
        setCropForm({ ...cropForm, [e.target.name]: e.target.value });
        setCropError(null);
    };

    const handleSoilPredict = (e) => {
        e.preventDefault();
        const url = `${import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000'}/api/soil/quality`;
        setSoilLoading(true);
        setSoilError(null);

        const numericData = {
            N: parseFloat(soilForm.N), P: parseFloat(soilForm.P), K: parseFloat(soilForm.K),
            pH: parseFloat(soilForm.pH), EC: parseFloat(soilForm.EC), OC: parseFloat(soilForm.OC),
            S: parseFloat(soilForm.S), Zn: parseFloat(soilForm.Zn), Fe: parseFloat(soilForm.Fe),
            Cu: parseFloat(soilForm.Cu), Mn: parseFloat(soilForm.Mn), B: parseFloat(soilForm.B),
        };

        if (Object.values(numericData).some(isNaN)) {
            setSoilError('Please fill in all 12 soil parameters before submitting.');
            setSoilLoading(false);
            return;
        }

        fetch(url, {
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(numericData),
        })
            .then((response) => response.json())
            .then((response) => {
                setSoilResult(response.prediction);
                setSoilLoading(false);
                setShowSoilResult(true);
            })
            .catch((error) => {
                console.error('There was an error making the prediction request!', error);
                setSoilLoading(false);
                setSoilError('Could not reach the prediction service. Please try again.');
            });
    };

    const handleCropPredict = async (e) => {
        e.preventDefault();
        setCropError(null);
        setCropLoading(true);
        setReport(null);

        try {
            const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
            const url = `${base}/api/croprecommendation/predict`;

            const N = parseFloat(cropForm.Nitrogen);
            const P = parseFloat(cropForm.Phosphorus);
            const K = parseFloat(cropForm.Potassium);
            const T = parseFloat(cropForm.Temperature);
            const H = parseFloat(cropForm.Humidity);
            const ph = parseFloat(cropForm.ph);
            const R = parseFloat(cropForm.Rainfall);

            if ([N, P, K, T, H, ph, R].some(isNaN)) {
                setCropError('Please fill in all soil parameters before submitting.');
                setCropLoading(false);
                return;
            }
            if (T < -50 || T > 60)  { setCropError('Temperature must be between -50 and 60 °C.'); setCropLoading(false); return; }
            if (H < 0 || H > 100)   { setCropError('Humidity must be between 0 and 100 %.'); setCropLoading(false); return; }
            if (ph < 0 || ph > 14)  { setCropError('Soil pH must be between 0 and 14.'); setCropLoading(false); return; }

            const payload = {
                category: cropForm.category,
                Nitrogen: N, Phosphorus: P, Potassium: K,
                Temperature: T, Humidity: H, ph: ph, Rainfall: R,
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

            const crop = data?.Prediction;
            if (!crop) {
                throw new Error(`Prediction not returned by server. Response keys: ${Object.keys(data || {}).join(', ')}`);
            }

            const confidence = typeof data?.Confidence === 'number' ? data.Confidence : null;
            const alternatives = Array.isArray(data?.Alternatives) ? data.Alternatives : [];
            const aiInsight = data?.AIInsight || null;

            const reasons = computeReasons(crop, cropForm);
            const expectedYield = computeExpectedYield(crop, reasons);
            const fertilizer = computeFertilizer(crop, cropForm);
            const water = getWaterRequirement(crop);
            const marketPrice = getMarketPrice(crop);
            const revenue = computeRevenue(crop, expectedYield);
            const risk = computeRiskLevel(confidence);
            const rotation = getRotationSuggestions(crop);

            setReport({ crop, confidence, alternatives, reasons, fertilizer, water, expectedYield, marketPrice, revenue, risk, rotation, aiInsight });
        } catch (err) {
            setCropError("Couldn't reach the prediction service. Please try again.");
        } finally {
            setCropLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
            {/* Hero */}
            <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
                <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
                <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
                <div className="mx-auto max-w-7xl">
                    <button onClick={() => navigate('/soil')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Back to Soil Hub
                    </button>
                    <div className="max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
                            <Sparkles size={14} className="text-lime-300" /> AI soil quality suite
                        </div>
                        <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Soil Quality Prediction
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
                            Predict your soil quality class and get the best crop recommendation — all from one smart dashboard.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-emerald-100">
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Quality classification</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Crop recommendations</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-lime-300" /> Testing centers map</span>
                    </div>
                </div>
            </section>

            <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
                <div className="-mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
                    {/* Tabs */}
                    <div className="flex flex-col sm:flex-row border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('quality')}
                            className={`flex items-center justify-center gap-2 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.08em] transition-colors ${
                                activeTab === 'quality'
                                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Shield size={17} /> Soil Quality Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('crop')}
                            className={`flex items-center justify-center gap-2 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.08em] transition-colors ${
                                activeTab === 'crop'
                                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Sprout size={17} /> Crop Recommendation
                        </button>
                    </div>

                    <div className="p-5 sm:p-8 lg:p-10">
                        {/* ===== SOIL QUALITY TAB ===== */}
                        {activeTab === 'quality' && (
                            <div>
                                <div className="mb-8 flex items-start gap-4">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Shield size={22} /></div>
                                    <div>
                                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-600">Quality assessment</p>
                                        <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Enter your soil lab values</h2>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-500">Add all 12 parameters from your latest soil test report.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSoilPredict} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                                    {soilFields.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <label htmlFor={`soil-${field.key}`} className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">{field.label}</label>
                                                {field.unit && <span className="text-xs font-medium text-slate-400">{field.unit}</span>}
                                            </div>
                                            <input
                                                id={`soil-${field.key}`}
                                                type="number"
                                                step="any"
                                                inputMode="decimal"
                                                name={field.key}
                                                value={soilForm[field.key]}
                                                onChange={handleSoilChange}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    ))}

                                    <div className="sm:col-span-2 lg:col-span-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={soilLoading}
                                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                        >
                                            {soilLoading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" /> Analyzing your soil...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield size={18} /> Predict Soil Quality
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-3 text-center text-xs text-slate-400">Your values are used only to prepare this prediction.</p>
                                    </div>
                                </form>

                                {soilError && (
                                    <div className="mt-6 flex items-start gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" /> {soilError}
                                    </div>
                                )}

                                {showSoilResult && <QualityResultCard quality={soilResult} />}
                            </div>
                        )}

                        {/* ===== CROP RECOMMENDATION TAB ===== */}
                        {activeTab === 'crop' && (
                            <div>
                                <div className="mb-8 flex items-start gap-4">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700"><Sprout size={22} /></div>
                                    <div>
                                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-green-600">AI crop intelligence</p>
                                        <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Get your recommended crop plan</h2>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-500">Use your latest soil-test values for the most reliable result.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleCropPredict} className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                                    <div className="sm:col-span-2 space-y-2 mb-2">
                                        <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">What are you growing?</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                            {[
                                                { value: 'field_crops', label: '🌾 Field Crops', desc: 'Rice, Wheat, Maize...' },
                                                { value: 'vegetables',  label: '🥦 Vegetables',  desc: 'Tomato, Potato...' },
                                                { value: 'flowers',     label: '🌸 Flowers',     desc: 'Rose, Tulip...' },
                                            ].map(opt => (
                                                <button key={opt.value} type="button"
                                                    onClick={() => setCropForm({ ...cropForm, category: opt.value })}
                                                    className={`rounded-xl border-2 px-3 py-3 text-center transition ${cropForm.category === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
                                                    <div className="text-base font-semibold">{opt.label}</div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {cropFields.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <label htmlFor={`crop-${field.key}`} className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">{field.label}</label>
                                                <span className="text-xs font-medium text-slate-400">{field.unit}</span>
                                            </div>
                                            <input
                                                id={`crop-${field.key}`}
                                                type="number"
                                                step="any"
                                                inputMode="decimal"
                                                name={field.key}
                                                value={cropForm[field.key]}
                                                onChange={handleCropChange}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    ))}

                                    <div className="pt-2 sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={cropLoading}
                                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                        >
                                            {cropLoading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" /> Analyzing your field data...
                                                </>
                                            ) : (
                                                <>
                                                    <Sprout size={18} /> Generate crop recommendation
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-3 text-center text-xs text-slate-400">Your values are used only to prepare this recommendation.</p>
                                    </div>
                                </form>

                                {cropError && (
                                    <div className="mt-6 flex items-start gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" /> {cropError}
                                    </div>
                                )}

                                {report && <CropReportCard report={report} />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-10 bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-5 sm:p-8">
                    <div className="text-center mb-6">
                        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Find a lab</p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">Soil Testing Centers Map</h2>
                        <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
                        <p className="mt-4 text-sm text-slate-500 max-w-2xl mx-auto">
                            Locate a nearby government soil testing center. Click a green marker to see contact details and available services.
                        </p>
                    </div>
                    <div
                        id="map"
                        className="flex items-center justify-center w-full h-72 sm:h-96 rounded-2xl border-2 border-green-200 bg-slate-50 overflow-hidden"
                    >
                        <Leaf size={22} className="text-emerald-600 mr-2" /> Loading soil testing centers…
                    </div>
                </div>

                {/* Why it matters */}
                <div className="mt-10 bg-gradient-to-br from-green-700 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles size={14} className="text-lime-300" /> Why it matters
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Soil quality prediction empowers smarter farming</h2>
                    <p className="max-w-2xl mx-auto text-sm leading-relaxed text-emerald-50/80">
                        By predicting soil quality class and pairing it with crop recommendations, you can boost yields,
                        lower input costs, and farm more sustainably — season after season.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 text-left">
                        {[
                            { icon: '✅', title: 'Higher yields', desc: 'Grow crops matched to your soil' },
                            { icon: '📉', title: 'Lower costs', desc: 'Apply only what your soil needs' },
                            { icon: '🌱', title: 'Sustainable', desc: 'Protect long-term soil fertility' },
                            { icon: '🔄', title: 'Smarter rotation', desc: 'Know which crop to plant next' },
                        ].map((f) => (
                            <div key={f.title} className="rounded-2xl bg-white/10 border border-white/15 p-5">
                                <div className="text-2xl mb-2">{f.icon}</div>
                                <h4 className="text-base font-extrabold mb-1">{f.title}</h4>
                                <p className="text-xs leading-relaxed text-emerald-50/80">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Advantages / Disadvantages */}
                <div className="w-full p-1 items-center rounded-2xl mt-10">
                    <div className="text-center mb-8">
                        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Insights</p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">Analysis Overview</h2>
                        <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
                    </div>
                    <AdvantagesDisadvantages items={items} />
                </div>
            </main>
        </div>
    );
};

export default SoilQuality;

