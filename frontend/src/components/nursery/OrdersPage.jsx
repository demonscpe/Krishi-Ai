import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';
import { Shimmer } from './ui/Shimmer';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, cls: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Accepted', icon: CheckCircle2, cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', icon: CheckCircle2, cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, cls: 'bg-red-100 text-red-700' },
  rejected: { label: 'Rejected', icon: XCircle, cls: 'bg-red-100 text-red-700' },
  dispatched: { label: 'Dispatched', icon: Truck, cls: 'bg-purple-100 text-purple-700' },
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, loadOrders, feedLoading } = useNursery();

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <h1 className="flex-1 font-bold flex items-center gap-2"><Package size={18} /> My Orders</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {feedLoading ? (
          <Shimmer className="h-40 rounded-2xl" />
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">No orders yet</p>
            <button onClick={() => navigate('/nursery/marketplace')} className="mt-4 bg-green-600 text-white font-semibold rounded-xl px-6 py-2.5">Start Shopping</button>
          </div>
        ) : (
          orders.map((order) => {
            const S = statusConfig[order.status] || statusConfig.pending;
            const Icon = S.icon;
            return (
              <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{order.orderId}</p>
                    <p className="text-xs text-slate-500">{order.nurseryName || order.nurseryId}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${S.cls}`}><Icon size={14} /> {S.label}</span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {order.items?.map((it) => (
                    <div key={it.plantId} className="flex justify-between">
                      <span>{it.plantName} × {it.quantity}</span>
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 my-3 pt-3 flex justify-between font-bold text-slate-800 dark:text-slate-100">
                  <span>Total</span><span>₹{order.total}</span>
                </div>
                <p className="text-xs text-slate-400 capitalize">{order.fulfillmentType} · {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : ''}</p>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
