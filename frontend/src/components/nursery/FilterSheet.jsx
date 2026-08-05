import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { motion, AnimatePresence } from 'framer-motion';

const DISTANCES = [5, 10, 25, 50];
const CATEGORIES = ['Vegetables', 'Fruits', 'Flowers', 'Medicinal', 'Forest', 'Organic'];
const RATINGS = [4.5, 4.0, 3.5, 3.0];

const FilterSheet = ({ open, onClose }) => {
  const { filters, setFilters, applyFilters, resetFilters } = useNursery();
  const [local, setLocal] = useState(filters);

  const toggleItem = (key, val) => {
    setLocal((prev) => {
      const arr = prev[key] || [];
      const has = arr.includes(val);
      return { ...prev, [key]: has ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const toggleBool = (key) => setLocal((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-white dark:bg-slate-800 max-h-[85vh] overflow-y-auto pb-8">
            <div className="sticky top-0 bg-white dark:bg-slate-800 px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Filters</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-6">
              {/* Distance */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Distance</h3>
                <div className="flex flex-wrap gap-2">
                  {DISTANCES.map((d) => (
                    <button key={d} onClick={() => setLocal((p) => ({ ...p, distance: p.distance === d ? null : d }))}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${local.distance === d ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                      {d} KM
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => toggleItem('categories', c)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${(local.categories || []).includes(c) ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {RATINGS.map((r) => (
                    <button key={r} onClick={() => setLocal((p) => ({ ...p, rating: p.rating === r ? null : r }))}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${local.rating === r ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                      {r}+ ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {[
                  { key: 'delivery', label: 'Delivery Available' },
                  { key: 'pickup', label: 'Pickup Available' },
                  { key: 'openNow', label: 'Open Now' },
                  { key: 'organic', label: 'Organic' },
                ].map((t) => (
                  <button key={t.key} onClick={() => toggleBool(t.key)} className="w-full flex items-center justify-between py-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.label}</span>
                    <span className={`h-6 w-11 rounded-full relative transition-colors ${local[t.key] ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${local[t.key] ? 'left-[22px]' : 'left-0.5'}`} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex gap-3">
              <button onClick={() => { resetFilters(); setLocal({}); }} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-3 font-semibold text-slate-600 dark:text-slate-300">Reset</button>
              <button onClick={() => { setFilters(local); applyFilters(); onClose(); }} className="flex-1 rounded-xl bg-green-600 text-white py-3 font-semibold">Apply Filters</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSheet;
