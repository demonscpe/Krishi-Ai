import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Leaf, Droplets, Sun, Calendar, Shield, Heart, ShoppingCart, Truck, Minus, Plus } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80';

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCropDetails, cropDetails, addToCart, toggleSave, wishlist } = useNursery();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getCropDetails(id);
  }, [id]);

  const crop = cropDetails;
  const images = crop?.images?.length ? crop.images : [crop?.imageUrl || FALLBACK_IMG];
  const saved = wishlist.crops?.some((c) => c.plantId === id);

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors pb-24">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <h1 className="flex-1 font-bold">Crop Details</h1>
          <button onClick={() => toggleSave('crop', id)} className="p-2 rounded-full bg-white/10">
            <Heart size={18} fill={saved ? 'red' : 'none'} className={saved ? 'text-red-500' : 'text-white'} />
          </button>
        </div>
      </header>

      {!crop ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-4">
          {/* Image Slider */}
          <div className="rounded-3xl overflow-hidden shadow-lg mb-5">
            <Carousel showThumbs={false} showStatus={false} autoPlay infiniteLoop>
              {images.map((img, i) => (
                <div key={i} className="h-72 sm:h-96">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </Carousel>
          </div>

          {/* Title & price */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{crop.plantName}</h2>
                {crop.scientificName && <p className="text-sm italic text-slate-400">{crop.scientificName}</p>}
                <span className="inline-block mt-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1">{crop.category}</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-green-600">₹{crop.price}</p>
                <p className="text-xs text-slate-400">{crop.quantity} available</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {crop.organic && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold px-3 py-1"><Leaf size={12} /> Organic</span>}
              {crop.healthy !== false && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1"><Shield size={12} /> Healthy</span>}
              {crop.deliveryAvailable && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1"><Truck size={12} /> Delivery</span>}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{crop.description || 'No description provided.'}</p>
          </div>

          {/* Attributes */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Plant Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: <Calendar size={16} />, label: 'Age', value: crop.plantAge ? `${crop.plantAge} ${crop.plantAgeUnit || 'months'}` : '—' },
                { icon: <Leaf size={16} />, label: 'Height', value: crop.height ? `${crop.height} cm` : '—' },
                { icon: <Droplets size={16} />, label: 'Water', value: crop.waterRequirement || '—' },
                { icon: <Sun size={16} />, label: 'Sunlight', value: crop.sunlightRequirement || '—' },
                { icon: <Calendar size={16} />, label: 'Season', value: crop.growingSeason || '—' },
                { icon: <Shield size={16} />, label: 'Disease', value: crop.diseaseResistance || 'Good' },
              ].map((a) => (
                <div key={a.label} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">{a.icon} {a.label}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{a.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nursery info */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Sold by</h3>
            <button onClick={() => navigate(`/nursery/profile/${crop.nurseryId}`)} className="flex items-center gap-3 w-full text-left">
              <img src={crop.nurseryImage || FALLBACK_IMG} className="h-12 w-12 rounded-xl object-cover" alt="" />
              <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{crop.nurseryName}</p>
                <p className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} /> {crop.distance_km ? `${crop.distance_km.toFixed(1)} km away` : 'Distance unknown'}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-amber-500"><Star size={12} fill="currentColor" /> {crop.nurseryRating ? crop.nurseryRating.toFixed(1) : '—'}</span>
            </button>
          </div>

          {/* Quantity + Buy */}
          <div className="sticky bottom-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-600 p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Plus size={16} /></button>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-xl font-extrabold text-green-600">₹{(crop.price * qty).toFixed(2)}</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { addToCart({ ...crop, quantity: qty }); toast.success('Added to cart'); }}
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold rounded-xl px-5 py-3 hover:bg-green-700">
              <ShoppingCart size={18} /> Buy Now
            </motion.button>
          </div>
        </main>
      )}
    </div>
  );
};

export default CropDetails;
