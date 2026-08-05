import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, Phone, MessageCircle, Share2, Heart, BadgeCheck,
  Clock, Car, Truck, Leaf, Shield, Navigation, Users, Camera, Minus, Plus, ShoppingCart,
} from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { CropCard } from './ui/Cards';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80';

const NurseryProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNurseryDetail, nurseryDetail, toggleSave, wishlist, addToCart, submitReview } = useNursery();

  useEffect(() => {
    getNurseryDetail(id);
  }, [id]);

  const n = nurseryDetail;
  const saved = wishlist.nurseries?.some((x) => x.id === id);

  const shareNursery = async () => {
    try {
      await navigator.share({ title: n?.nurseryName, url: window.location.href });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors pb-24">
      {/* Cover */}
      <div className="relative h-64 sm:h-80">
        <img src={n?.coverImage || n?.imageUrl || FALLBACK_IMG} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white backdrop-blur"><ArrowLeft size={20} /></button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={shareNursery} className="p-2 rounded-full bg-black/40 text-white backdrop-blur"><Share2 size={18} /></button>
          <button onClick={() => toggleSave('nursery', id)} className="p-2 rounded-full bg-black/40 text-white backdrop-blur"><Heart size={18} fill={saved ? 'red' : 'none'} className={saved ? 'text-red-500' : 'text-white'} /></button>
        </div>
      </div>

      {!n ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : (
        <main className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
          {/* Header card */}
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-xl mb-4">
            <div className="flex items-start gap-4">
              <img src={n.logo || n.imageUrl || FALLBACK_IMG} className="h-20 w-20 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow" alt="" />
              <div className="flex-1">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {n.nurseryName}
                  {n.verified && <BadgeCheck size={22} className="text-blue-500" />}
                </h1>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold"><Star size={16} fill="currentColor" /> {n.rating ? n.rating.toFixed(1) : 'New'}</span>
                  <span className="text-slate-400">· {n.followers || 0} followers</span>
                  {n.deliveryAvailable && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-600 text-xs px-2 py-0.5"><Truck size={12} /> Delivery</span>}
                </div>
                <p className="flex items-center gap-1 text-sm text-slate-500 mt-1.5"><MapPin size={14} /> {n.address}</p>
                <p className="text-xs text-slate-400">{n.distance_km ? `${n.distance_km.toFixed(1)} km away` : ''} · {n.open_now ? 'Open now' : 'Closed'}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${n.latitude},${n.longitude}`} target="_blank" rel="noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl bg-green-50 dark:bg-green-900/40 text-green-700 py-3 text-xs font-semibold"><Navigation size={18} /> Directions</a>
              <a href={`tel:${n.phone}`} className="flex flex-col items-center gap-1 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 py-3 text-xs font-semibold"><Phone size={18} /> Call</a>
              <a href={`https://wa.me/${n.phone}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 py-3 text-xs font-semibold"><MessageCircle size={18} /> WhatsApp</a>
              <button onClick={() => navigate('/nursery/chat/' + id)} className="flex flex-col items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 text-xs font-semibold"><MessageCircle size={18} /> Chat</button>
            </div>
          </div>

          {/* About + facilities */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 mb-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-2">About</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.about || `${n.nurseryName} is a nursery providing quality seedlings and plants.`}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {n.parking && <span className="flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 text-xs px-3 py-1"><Car size={12} /> Parking</span>}
              {n.deliveryAvailable && <span className="flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 text-xs px-3 py-1"><Truck size={12} /> Delivery</span>}
              {n.organicCertified && <span className="flex items-center gap-1 rounded-full bg-green-50 text-green-600 text-xs px-3 py-1"><Leaf size={12} /> Organic Certified</span>}
              {n.govtApproved && <span className="flex items-center gap-1 rounded-full bg-blue-50 text-blue-600 text-xs px-3 py-1"><Shield size={12} /> Govt Approved</span>}
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
              <Clock size={14} /> {n.openingTime} - {n.closingTime} · {n.openDays || 'Open all days'}
            </div>
          </div>

          {/* Gallery */}
          {(n.gallery?.length > 0) && (
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 mb-4">
              <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 mb-3"><Camera size={18} /> Gallery</h2>
              <div className="grid grid-cols-3 gap-2">
                {n.gallery.map((g, i) => <img key={i} src={g} className="h-24 w-full object-cover rounded-xl" loading="lazy" alt="" />)}
              </div>
            </div>
          )}

          {/* Available crops */}
          {n.plants?.length > 0 && (
            <div className="mb-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3">{n.plants.length} Available Crops</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {n.plants.map((p) => <CropCard key={p.id || p.plantId} crop={{ ...p, plantId: p.id || p.plantId, nurseryName: n.nurseryName }} />)}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Reviews ({n.reviews?.length || 0})</h2>
            {n.reviews?.length > 0 ? (
              <div className="space-y-3">
                {n.reviews.map((r, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-amber-500 text-sm"><Star size={14} fill="currentColor" /> {r.rating}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{r.userName || 'Farmer'}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{r.comment || 'No comment'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No reviews yet. Be the first to review.</p>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default NurseryProfilePage;
