import React from 'react';
import { Link } from 'react-router-dom';

const Market = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 font-poppins">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2">Marketplace</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Agro Market (Sample)</h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-slate-600 mb-4">
            This is a sample market page. Replace with real marketplace components (product listing, filters,
            cart, payments) as needed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-slate-800">Sample Product A</h3>
              <p className="text-sm text-slate-500">Price: ₹1,200</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-slate-800">Sample Product B</h3>
              <p className="text-sm text-slate-500">Price: ₹850</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link to="/AgroShop" className="px-4 py-2 rounded-xl bg-green-700 text-white">Go to AgroShop</Link>
            <Link to="/products" className="px-4 py-2 rounded-xl border border-gray-200">See Tools</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
