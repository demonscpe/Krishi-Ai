import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Store, CreditCard, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNursery } from '../../context/NurseryContext';
import { createOrder } from '../../lib/nurseryApi';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useNursery();
  const [fulfillment, setFulfillment] = useState('pickup');
  const [payment, setPayment] = useState('upi');
  const [placing, setPlacing] = useState(false);

  // Group by nursery
  const byNursery = {};
  cart.forEach((i) => {
    if (!byNursery[i.nurseryId]) byNursery[i.nurseryId] = [];
    byNursery[i.nurseryId].push({ plantId: i.plantId, quantity: i.quantity });
  });
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const placeOrders = async () => {
    setPlacing(true);
    try {
      const nurseryIds = Object.keys(byNursery);
      for (const nid of nurseryIds) {
        await createOrder({
          nursery_id: nid,
          items: byNursery[nid],
          fulfillment_type: fulfillment,
        });
      }
      toast.success('Order placed successfully! 🎉');
      clearCart();
      navigate('/nursery/orders');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <h1 className="flex-1 font-bold flex items-center gap-2"><Store size={18} /> Checkout</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Fulfillment */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><Truck size={16} className="text-green-600" /> Delivery / Pickup</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ id: 'pickup', label: 'Pickup' }, { id: 'delivery', label: 'Delivery' }].map((o) => (
              <button key={o.id} onClick={() => setFulfillment(o.id)} className={`rounded-xl border-2 p-3 text-sm font-semibold transition ${fulfillment === o.id ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30' : 'border-slate-200 text-slate-500 dark:border-slate-700'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-green-600" /> Payment Method</h3>
          <div className="grid grid-cols-3 gap-3">
            {[{ id: 'upi', label: 'UPI' }, { id: 'card', label: 'Card' }, { id: 'cod', label: 'Cash on Delivery' }].map((p) => (
              <button key={p.id} onClick={() => setPayment(p.id)} className={`rounded-xl border-2 p-3 text-xs font-semibold transition ${payment === p.id ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30' : 'border-slate-200 text-slate-500 dark:border-slate-700'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><IndianRupee size={16} className="text-green-600" /> Order Summary</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {cart.map((i) => (
              <div key={i.plantId} className="flex justify-between">
                <span>{i.name} × {i.quantity}</span><span>₹{i.price * i.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 my-4" />
          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100"><span>Total</span><span>₹{total}</span></div>
          <button onClick={placeOrders} disabled={placing} className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl py-3 hover:opacity-90 disabled:opacity-50">
            {placing ? 'Placing Order...' : `Place Order · ₹${total}`}
          </button>
        </section>
      </main>
    </div>
  );
};

export default CheckoutPage;
