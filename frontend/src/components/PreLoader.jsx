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
    <div className="classic-preloader fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#160d08] font-poppins">
      <style>{`
        @keyframes preloaderAtmosphere {
          0%, 100% { transform: translate3d(-8%, -5%, 0) scale(1); }
          50% { transform: translate3d(10%, 8%, 0) scale(1.18); }
        }
        @keyframes preloaderSunset {
          0%, 100% { transform: translate3d(10%, 8%, 0) scale(1); opacity: .35; }
          50% { transform: translate3d(-12%, -6%, 0) scale(1.25); opacity: .65; }
        }
        @keyframes preloaderLightSweep {
          0% { transform: translateX(-120%) rotate(-12deg); opacity: 0; }
          25%, 70% { opacity: .16; }
          100% { transform: translateX(120%) rotate(-12deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .classic-preloader *, .classic-preloader::before, .classic-preloader::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/20 blur-3xl"
        style={{ animation: 'preloaderAtmosphere 11s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 h-[32rem] w-[32rem] rounded-full bg-orange-700/20 blur-3xl"
        style={{ animation: 'preloaderSunset 14s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-1/3 h-24 w-[150%] bg-amber-200/10 blur-3xl"
        style={{ animation: 'preloaderLightSweep 9s ease-in-out infinite' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,4,2,0.42)_100%)]" />
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
            background: 'linear-gradient(135deg, #fbbf24, #f97316, #fde68a, #c2410c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
          }}
        >
          Krishi-Ai
        </h1>
      </div>
      <p className="relative z-10 text-[10px] sm:text-xs tracking-[0.45em] uppercase text-amber-200/60 font-semibold mb-10 text-center">
        Revolutionizing Agriculture
      </p>
      <div className="relative z-10 w-48 sm:w-64">
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-200 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center mt-2 text-[10px] text-amber-500/80 font-medium tracking-widest">
          {progress}%
        </p>
      </div>
    </div>
  );
};

export default Preloader; 