import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#07130d] px-6 font-poppins text-white">
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-lime-400/10 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.45, 0.2, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <motion.div
          className="relative mb-10 flex h-52 w-52 items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-3 rounded-full border border-emerald-300/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-8 rounded-full border border-dashed border-lime-300/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[3.75rem] rounded-full bg-emerald-300/10 blur-xl" />
          <motion.div
            className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-white/[0.08] shadow-[0_0_50px_rgba(74,222,128,0.2)] backdrop-blur-md"
            animate={{ y: [0, -8, 0], rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Leaf className="h-12 w-12 -rotate-12 text-lime-300" strokeWidth={1.5} />
          </motion.div>
          <motion.div
            className="absolute right-7 top-8 text-lime-200"
            animate={{ y: [-2, -10, -2], opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.5em] text-lime-300/70">Smart farming, naturally</p>
          <h1 className="high-font text-5xl font-black tracking-wide text-white sm:text-6xl">Krishi<span className="text-lime-300">-AI</span></h1>
        </motion.div>

        <motion.div
          className="mt-12 w-full max-w-xs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            <span>Growing your experience</span>
            <span className="text-lime-300">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10 p-px">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-300 to-white shadow-[0_0_14px_rgba(190,242,100,0.8)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-4 flex justify-center gap-1.5">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-1 w-1 rounded-full bg-lime-300"
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.18 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Preloader; 