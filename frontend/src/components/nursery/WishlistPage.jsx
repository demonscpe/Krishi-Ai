import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Store, Leaf } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { NurseryCard, CropCard } from './ui/Cards';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { loadWishlist, wishlist } = useNursery();

  useEffect(() => {
    loadWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <h1 className="flex-1 font-bold flex items-center gap-2"><Heart size={18} fill="currentColor" /> My Wishlist</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {wishlist.nurseries?.length > 0 && (
          <section className="mb-8">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 mb-4"><Store size={18} className="text-green-600" /> Saved Nurseries ({wishlist.nurseries.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.nurseries.map((n) => <NurseryCard key={n.id} nursery={n} />)}
            </div>
          </section>
        )}

        {wishlist.crops?.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 mb-4"><Leaf size={18} className="text-lime-600" /> Saved Crops ({wishlist.crops.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlist.crops.map((c) => <CropCard key={c.plantId} crop={c} />)}
            </div>
          </section>
        )}

        {wishlist.nurseries?.length === 0 && wishlist.crops?.length === 0 && (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">Your wishlist is empty</p>
            <p className="text-sm text-slate-400 mt-1">Tap the heart icon on nurseries & crops to save them here.</p>
            <button onClick={() => navigate('/nursery/marketplace')} className="mt-4 bg-green-600 text-white font-semibold rounded-xl px-6 py-2.5">Browse Nurseries</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
