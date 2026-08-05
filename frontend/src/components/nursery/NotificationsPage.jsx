import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Store, Leaf, ShoppingBag, Star, } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications } = useNursery();

  const DEMO = [
    { icon: Store, color: 'bg-green-100 text-green-600', title: 'Green Valley Nursery approved your order', time: '2h ago' },
    { icon: Leaf, color: 'bg-lime-100 text-lime-600', title: 'New Tomato seedlings available near you', time: '5h ago' },
    { icon: ShoppingBag, color: 'bg-blue-100 text-blue-600', title: 'Your order ORD-20240101 has been dispatched', time: '1d ago' },
    { icon: Star, color: 'bg-amber-100 text-amber-600', title: 'Saravana Nursery rated you', time: '2d ago' },
  ];
  const items = notifications.length ? notifications : DEMO;

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <h1 className="flex-1 font-bold flex items-center gap-2"><Bell size={18} /> Notifications</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {items.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={i} className="flex items-start gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${n.color}`}><Icon size={20} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default NotificationsPage;
