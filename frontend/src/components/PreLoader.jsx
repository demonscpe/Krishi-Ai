import React, { useEffect, useState } from 'react';
import '../index.css';

const Preloader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#060f08] z-[99999] overflow-hidden font-poppins">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="loader-wrapper scale-75 sm:scale-90 mb-10 relative z-10">
        <div className="loader__bar bar-1" />
        <div className="loader__bar bar-2" />
        <div className="loader__bar bar-3" />
        <div className="loader__bar bar-4" />
        <div className="loader__bar bar-5" />
        <div className="loader__ball" />
      </div>
      <div className="relative z-10 text-center mb-3">
        <h1
          className="high-font text-5xl sm:text-6xl md:text-7xl font-black uppercase select-none"
          style={{
            background: 'linear-gradient(135deg, #4ade80, #16a34a, #bbf7d0, #15803d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
          }}
        >
          Krishi-Ai
        </h1>
      </div>
      <p className="relative z-10 text-[10px] sm:text-xs tracking-[0.45em] uppercase text-green-500/60 font-semibold mb-10 text-center">
        Revolutionizing Agriculture
      </p>
      <div className="relative z-10 w-48 sm:w-64">
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center mt-2 text-[10px] text-green-700 font-medium tracking-widest">
          {progress}%
        </p>
      </div>
    </div>
  );
};

export default Preloader;
