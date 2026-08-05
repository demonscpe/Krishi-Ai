import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Truck, Leaf, Phone, MessageCircle, Heart, ChevronRight } from 'lucide-react';
import { useNursery } from '../../../context/NurseryContext';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80';

export const NurseryCard = ({ nursery, onView }) => {
  const navigate = useNavigate();
  const { toggleSave, wishlist } = useNursery();
  const saved = wishlist.nurseries?.some((n) => n.id === nursery.id);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all">
      <div className="relative h-36">
        <img src={nursery.coverImage || nursery.imageUrl || FALLBACK_IMG} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          {nursery.verified && <span className="rounded-full bg-blue-500 text-white text-[10px] px-2 py-0.5 font-bold">✓ Verified</span>}
          {nursery.featured && <span className="rounded-full bg-amber-500 text-white text-[10px] px-2 py-0.5 font-bold">★ Featured</span>}
        </div>
        <button onClick={() => toggleSave('nursery', nursery.id)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur">
          <Heart size={16} fill={saved ? 'red' : 'none'} className={saved ? 'text-red-500' : 'text-slate-500'} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{nursery.nurseryName}</h3>
        <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
          <Star size={12} fill="currentColor" /> <span className="text-slate-600 dark:text-slate-300">{nursery.rating ? nursery.rating.toFixed(1) : 'New'}</span>
          {nursery.distance_km != null && <span className="text-slate-400 ml-1">· {nursery.distance_km.toFixed(1)} km</span>}
        </div>
        <p className="flex items-center gap-1 text-xs text-slate-400 mt-1.5"><MapPin size={12} /> {nursery.address}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {nursery.deliveryAvailable && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300 text-[10px] px-2 py-0.5"><Truck size={10} /> Delivery</span>}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 text-[10px] px-2 py-0.5"><Leaf size={10} /> {nursery.cropCount || 0} Crops</span>
          <span className={`inline-flex items-center rounded-full text-[10px] px-2 py-0.5 ${nursery.open_now ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{nursery.open_now ? 'Open' : 'Closed'}</span>
        </div>
        <div className="flex gap-2 mt-3">
          {nursery.phone && <a href={`tel:${nursery.phone}`} className="p-2 rounded-lg bg-green-50 dark:bg-green-900/40 text-green-600"><Phone size={16} /></a>}
          {nursery.phone && <a href={`https://wa.me/${nursery.phone}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600"><MessageCircle size={16} /></a>}
          <button onClick={() => (onView ? onView(nursery) : navigate(`/nursery/profile/${nursery.id}`))}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 text-white text-sm font-semibold py-2 hover:bg-green-700 transition-colors">
            View Nursery <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CropCard = ({ crop }) => {
  const navigate = useNavigate();
  const { addToCart, toggleSave, wishlist } = useNursery();
  const saved = wishlist.crops?.some((c) => c.plantId === crop.plantId);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
      <div className="relative h-40">
        <img src={crop.imageUrl || FALLBACK_IMG} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-2 left-2 flex gap-1">
          {crop.organic && <span className="rounded-full bg-green-600 text-white text-[10px] px-2 py-0.5 font-bold">Organic</span>}
          {crop.quantity > 0 && <span className="rounded-full bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-bold">In Stock</span>}
        </div>
        <button onClick={() => toggleSave('crop', crop.plantId)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur">
          <Heart size={16} fill={saved ? 'red' : 'none'} className={saved ? 'text-red-500' : 'text-slate-500'} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{crop.plantName}</h3>
        {crop.scientificName && <p className="text-[11px] italic text-slate-400">{crop.scientificName}</p>}
        <p className="text-xs text-slate-400 mt-0.5">{crop.category}</p>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1"><MapPin size={11} /> {crop.nurseryName} {crop.distance_km != null && <span>· {crop.distance_km.toFixed(1)} km</span>}</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-extrabold text-green-600">₹{crop.price}</span>
          <span className="text-xs text-slate-400">{crop.quantity} available</span>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => addToCart(crop)} className="flex-1 rounded-lg bg-green-600 text-white text-sm font-semibold py-2 hover:bg-green-700">Buy Now</button>
          <button onClick={() => navigate(`/nursery/crop/${crop.plantId}`)} className="rounded-lg border border-green-600 text-green-600 text-sm font-semibold px-3 py-2 hover:bg-green-50">Details</button>
        </div>
      </div>
    </div>
  );
};
