import React, { useEffect, useState } from 'react';

const Preloader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Slower start, faster toward end for a premium feel
        const inc = prev < 30 ? 1 : prev < 70 ? 2 : 3;
        return prev + inc;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Canvas ring geometry
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, #0b1f12 0%, #060f08 55%, #030a05 100%)',
        overflow: 'hidden',
        fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '10%',
          width: 'clamp(160px, 22vw, 320px)',
          height: 'clamp(160px, 22vw, 320px)',
          background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'krishiFloat 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '8%',
          width: 'clamp(200px, 26vw, 380px)',
          height: 'clamp(200px, 26vw, 380px)',
          background: 'radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'krishiFloat 8s ease-in-out infinite reverse',
        }}
      />

      {/* Animated leaf particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { left: '8%', top: '70%', delay: '0s', size: '14px' },
          { left: '20%', top: '20%', delay: '1.2s', size: '10px' },
          { left: '70%', top: '75%', delay: '0.6s', size: '16px' },
          { left: '85%', top: '25%', delay: '1.8s', size: '11px' },
          { left: '45%', top: '85%', delay: '2.4s', size: '12px' },
          { left: '60%', top: '12%', delay: '0.9s', size: '13px' },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              borderRadius: '0 100% 0 100%',
              opacity: 0.35,
              animation: 'krishiFloat 5s ease-in-out infinite',
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Circular progress ring with plant icon */}
        <div style={{ position: 'relative', width: 'clamp(150px, 24vw, 260px)', height: 'clamp(150px, 24vw, 260px)' }}>
          <svg width="100%" height="100%" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            {/* Progress */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 0.2s ease',
                filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.6))',
              }}
            />
          </svg>

          {/* Plant / sprout icon in center */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ animation: 'krishiBounce 1.6s ease-in-out infinite', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Stem */}
              <div style={{ width: 4, height: 'clamp(24px, 4vw, 40px)', background: 'linear-gradient(#4ade80, #15803d)', borderRadius: 4 }} />
              {/* Leaves */}
              <div style={{ position: 'relative', width: 'clamp(40px, 6vw, 56px)', height: 'clamp(28px, 4vw, 40px)', marginTop: -6 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: '55%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    borderRadius: '100% 0 100% 0',
                    boxShadow: '0 0 14px rgba(74,222,128,0.5)',
                    animation: 'krishiLeafL 2s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    width: '55%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #22c55e, #15803d)',
                    borderRadius: '0 100% 0 100%',
                    boxShadow: '0 0 14px rgba(34,197,94,0.5)',
                    animation: 'krishiLeafR 2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 'clamp(16px, 3vw, 28px) 0 4px',
            fontSize: 'clamp(30px, 6vw, 64px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, #4ade80, #16a34a, #bbf7d0, #15803d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            lineHeight: 1.05,
            userSelect: 'none',
          }}
        >
          Krishi-AI
        </h1>

        {/* Tagline */}
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(9px, 1.6vw, 13px)',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: 'rgba(74,222,128,0.6)',
            fontWeight: 600,
            textAlign: 'center',
            paddingLeft: '0.45em',
          }}
        >
          Premium Agriculture
        </p>

        {/* Progress bar */}
        <div style={{ width: 'clamp(160px, 30vw, 280px)', marginTop: 'clamp(18px, 3vw, 30px)' }}>
          <div
            style={{
              height: 3,
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #16a34a, #4ade80, #bbf7d0)',
                borderRadius: 999,
                transition: 'width 0.2s ease',
                boxShadow: '0 0 10px rgba(74,222,128,0.6)',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 'clamp(8px, 1.4vw, 11px)',
                color: 'rgba(74,222,128,0.45)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Loading
            </span>
            <span
              style={{
                fontSize: 'clamp(12px, 2vw, 16px)',
                fontWeight: 700,
                color: '#4ade80',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes krishiBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.04); }
        }
        @keyframes krishiLeafL {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes krishiLeafR {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes krishiFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
