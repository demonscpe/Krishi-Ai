import React, { useEffect, useState } from 'react';

const ProgressScrollDown = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // set initial value on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .scroll-progress-track {
          position: fixed;
          top: 64px;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(34, 197, 94, 0.1);
          z-index: 9998;
        }
        .scroll-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #16a34a, #34d399);
          border-radius: 0 9999px 9999px 0;
          transition: width 75ms linear;
        }
      `}</style>

      <div className="scroll-progress-track">
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </>
  );
};

export default ProgressScrollDown;