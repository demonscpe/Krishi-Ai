import React from 'react';
import { useNavigate } from 'react-router-dom';
import aiImage from '../assets/ai.jpg';
const AdvantagesDisadvantages = () => {
  const navigate = useNavigate();
  const points = [
    "Best crop prediction using soil & climate data",
    "Real-time monitoring with AI sensors & drones",
    "Precision irrigation & pesticide optimization",
    "Soil health insights for better productivity",
    "Accurate weather forecasting",
    "Advanced yield prediction",
    "Pest & weed detection automation",
    "Improved labor efficiency",
    "Optimized supply chain",
  ];
  return (
    <section className="py-14 bg-gradient-to-b from-green-50 to-white font-poppins">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Intelligence</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 tracking-tight">
            Why AI in Agriculture?
          </h2>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
        </div>

      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2 flex justify-center">
          <img
            src={aiImage}
            alt="AI in Agriculture"
            className="w-[260px] sm:w-[320px] md:w-[400px] rounded-xl shadow-lg hover:scale-105 transition duration-300"
          />
        </div>
        <div className="md:w-1/2">
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition">
            
            <h3 className="text-lg font-semibold text-green-700 mb-3">
              AI Solutions
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              {points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600">✔</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button
                onClick={() => navigate('/whyai')}
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-800 rounded-full shadow-md hover:shadow-lg transition duration-300"
              >
                Know More
              </button>
            </div>

          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default AdvantagesDisadvantages;
