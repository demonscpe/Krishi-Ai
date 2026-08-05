import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Store } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useNursery();

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <h1 className="flex-1 font-bold flex items-center gap-2"><ShoppingCart size={18} /> My Cart ({cart.length})</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">Your cart is empty</p>
            <button onClick={() => navigate('/nursery/marketplace')} className="mt-4 bg-green-600 text-white font-semibold rounded-xl px-6 py-2.5">Browse Plants</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <div key={item.plantId} className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                  <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Store size={12} /> {item.nurseryId}</p>
                    <p className="text-green-600 font-bold">₹{item.price} <span className="text-xs font-normal text-slate-400">× {item.quantity}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => addToCart(item, -1)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"><Minus size={16} /></button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => addToCart(item, 1)} className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.plantId)} className="p-2 rounded-full text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Items</span><span>{cart.length}</span></div>
                <div className="flex justify-between"><span>Subtotal</span><span>₹{total}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className="text-green-600">Nursery to confirm</span></div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 my-4" />
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100"><span>Total</span><span>₹{total}</span></div>
              <button onClick={() => navigate('/nursery/checkout')} className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl py-3 hover:opacity-90 transition">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
