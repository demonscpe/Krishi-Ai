import React from 'react';
import { Sparkles, CheckCircle2, Leaf } from 'lucide-react';
import bgHero from "../assets/bgHero.png";
import croppingImg from '../assets/cropinspection.png';
import fertilizingImg from '../assets/irrigation.jpg';
import pestControlImg from '../assets/tp.png';
import waterManagementImg from '../assets/img11.jpg';

const bestPractices = [
  {
    title: 'Best Practices for Cropping',
    description: 'Proper cropping techniques ensure sustainable and productive farming.',
    img: croppingImg,
    subtopics: [
      'Crop Rotation — Break pest cycles and replenish nitrogen naturally.',
      'Intercropping — Grow multiple crops together to optimize space.',
      'Cover Cropping — Plant off-season crops to prevent erosion.',
      'Selecting Crop Varieties — Choose disease-resistant local varieties.',
    ],
  },
  {
    title: 'Water Management',
    description: 'Implement smart irrigation and rainwater harvesting to ensure adequate hydration.',
    img: waterManagementImg,
    subtopics: [
      'Smart Irrigation — Use drip systems with moisture sensors.',
      'Rainwater Harvesting — Capture and store rainwater.',
      'Moisture Monitoring — Use sensors to prevent over-watering.',
      'Water Conservation — Apply mulching to retain soil moisture.',
    ],
  },
  {
    title: 'Fertilizing Techniques',
    description: 'Understand soil needs through testing and use balanced nutrients.',
    img: fertilizingImg,
    subtopics: [
      'Soil Testing — Determine nutrient deficiencies for right N-P-K.',
      'Organic vs. Inorganic — Use compost for structure, inorganic for rapid delivery.',
      'Micro Nutrients — Address deficiencies in zinc and manganese.',
      'Timing of Application — Apply during peak growth stages.',
    ],
  },
  {
    title: 'Pest Control Strategies',
    description: 'Maintain healthy crops using integrated management and natural predators.',
    img: pestControlImg,
    subtopics: [
      'IPM Systems — Combine biological and physical tools.',
      'Biological Control — Encourage natural predators like ladybugs.',
      'Cultural Practices — Alter planting times to avoid pests.',
      'Selective Pesticide Use — Apply only when necessary.',
    ],
  },
  {
    title: 'Soil Health & Conservation',
    description: 'Protect soil structure and microbial life for long-term fertility.',
    img: waterManagementImg,
    subtopics: [
      'No-Till Farming — Keep soil structure intact.',
      'Mulching — Cover soil to regulate temperature.',
      'Green Manure — Plow back plants to boost organic content.',
      'pH Management — Adjust acidity for nutrient availability.',
    ],
  },
  {
    title: 'Livestock Integration',
    description: 'Combine animal husbandry with crop production for closed-loop nutrients.',
    img: croppingImg,
    subtopics: [
      'Rotational Grazing — Prevent overgrazing and fertilize land.',
      'Manure Management — Convert waste into organic fertilizer.',
      'Silvopasture — Combine trees with forage and livestock.',
      'Animal Health — Focus on preventative care.',
    ],
  },
  {
    title: 'Post-Harvest Handling',
    description: 'Reduce waste by improving storage, transport, and processing.',
    img: fertilizingImg,
    subtopics: [
      'Proper Drying — Prevent mold by drying to specific levels.',
      'Cold Storage — Extend shelf life with temperature control.',
      'Sorting and Grading — Maximize market value.',
      'Efficient Packaging — Use breathable, eco-friendly materials.',
    ],
  },
  {
    title: 'Agroforestry Practices',
    description: 'Incorporate trees into your landscape for better microclimates.',
    img: pestControlImg,
    subtopics: [
      'Alley Cropping — Plant crops between tree rows.',
      'Windbreaks — Protect crops from high wind damage.',
      'Riparian Buffers — Filter runoff near water bodies.',
      'Multi-Story Cropping — Grow shade-tolerant crops under trees.',
    ],
  },
];

const BestPractices = () => {
  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Farming guide
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Best Practices in Sustainable Farming
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              A comprehensive guide to modern agriculture — mastering these 8 pillars ensures long-term productivity and environmental health.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bestPractices.map((practice, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4">
                    <img src={practice.img} alt={practice.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">{practice.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{practice.description}</p>
                  <div className="space-y-2">
                    {practice.subtopics.map((sub, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-600">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 bg-gradient-to-br from-green-700 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-lime-300" /> Sustainable agriculture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Master sustainable farming</h2>
          <p className="max-w-2xl mx-auto text-sm leading-relaxed text-emerald-50/80">
            Each pillar works together to create a resilient, productive, and environmentally friendly farming system.
          </p>
        </div>
      </main>
    </div>
  );
};

export default BestPractices;

