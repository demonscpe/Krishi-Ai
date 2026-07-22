import React from 'react';
import "../index.css";

const Preloader = () => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center z-[100] bg-[#000000] px-4 overflow-hidden">
      <div className="loader-wrapper scale-[0.65] sm:scale-80 md:scale-100 mb-8">
        <div className="loader__bar bar-1"></div>
        <div className="loader__bar bar-2"></div>
        <div className="loader__bar bar-3"></div>
        <div className="loader__bar bar-4"></div>
        <div className="loader__bar bar-5"></div>
        <div className="loader__ball"></div>
      </div>
      <div className="relative w-full max-w-[600px] flex justify-center items-center h-[100px] sm:h-[120px]">
        <h1 className="title relative z-[1] w-full text-center text-white bg-black font-black uppercase high-font m-0 text-[45px] sm:text-[65px] md:text-[85px] tracking-wide">
          Krishi-Ai
        </h1>
      </div>
      <p className="mt-8 text-green-400/60 text-[9px] sm:text-xs md:text-sm tracking-[0.4em] sm:tracking-[0.8em] uppercase font-bold animate-pulse text-center">
        Revolutionizing Agriculture
      </p>

    </div>
  );
};

export default Preloader;