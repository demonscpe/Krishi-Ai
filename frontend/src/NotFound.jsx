import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-poppins text-center">
      {/* Big 404 */}
      <div
        className="text-[120px] sm:text-[160px] font-black leading-none select-none"
        style={{
          background: 'linear-gradient(135deg, #16a34a, #4ade80)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        404
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 mb-3">
        Page Not Found
      </h1>
      <p className="text-sm sm:text-base text-slate-500 max-w-sm mb-8 leading-relaxed">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/"
        className="px-8 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-full shadow-md transition-all duration-200 hover:scale-105"
      >
        ← Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
