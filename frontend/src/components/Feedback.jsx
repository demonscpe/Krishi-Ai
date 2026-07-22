import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Feedback() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Thank you for your feedback!');
      setForm({ name: '', email: '', message: '' });
    }, 1000);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 font-poppins">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Your Voice</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Share Your Feedback</h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
          <p className="mt-4 text-sm text-slate-500 leading-relaxed">
            Your thoughts and suggestions help us grow. We'd love to hear from you!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-green-600 to-emerald-400" />
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name</label>
                <input
                  type="text" required placeholder="Your name" className={inputClass}
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email" required placeholder="your@email.com" className={inputClass}
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Feedback</label>
                <textarea
                  rows={5} required placeholder="Share your experience, suggestions, or issues..." className={inputClass}
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
          <div className="bg-green-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-slate-500">
              Thank you for taking time to share your thoughts. Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
