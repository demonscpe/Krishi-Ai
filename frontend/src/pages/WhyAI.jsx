import React from 'react';
import cropMonitoringImg from '../assets/crop_monitor.jpg';
import soilAnalysisImg from '../assets/soil_analysis.jpg';
import supplyChainImg from '../assets/supply.jpg';
import roboticsImg from '../assets/robo.jpg';
import weather from '../assets/weather.jpg';
import irrigation from '../assets/irrigation.jpg';

const applications = [
  { title: 'Crop Monitoring', description: 'Detect crop diseases early using AI-powered image analysis.', img: cropMonitoringImg },
  { title: 'Soil Analysis', description: 'Analyze soil nutrients for better yield and soil health.', img: soilAnalysisImg },
  { title: 'Supply Chain', description: 'Optimize logistics and delivery from farm to market.', img: supplyChainImg },
  { title: 'Weather Forecast', description: 'Plan farming activities with accurate local predictions.', img: weather },
  { title: 'Smart Irrigation', description: 'Optimize water usage efficiently with sensor data.', img: irrigation },
  { title: 'Automation', description: 'Use robotics for precision planting and harvesting.', img: roboticsImg },
];

const WhyAI = () => {
  return (
    <div className="min-h-screen bg-white pt-20 pb-16 px-4 font-poppins text-slate-900">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Intelligence</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Why AI in Agriculture?</h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
          <p className="mt-4 text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            AI is transforming farming with smarter decisions, better resource usage, and improved productivity for every farmer.
          </p>
        </div>

        {/* Benefits + Future */}
        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <h3 className="text-base font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-black">✔</span>
              Key Benefits
            </h3>
            {['Precision farming with data-driven inputs', 'Accurate crop yield prediction models', 'Sustainable agriculture practices', 'Reduced cost of production'].map((t, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-slate-600 mb-2.5 items-start">
                <span className="text-green-600 mt-0.5 flex-shrink-0">→</span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <h3 className="text-base font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-black">◈</span>
              Future Outlook
            </h3>
            {['IoT sensor network integration', 'Blockchain supply chain transparency', 'Climate change resilience tools', 'Autonomous drone monitoring'].map((t, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-slate-600 mb-2.5 items-start">
                <span className="text-green-600 mt-0.5 flex-shrink-0">→</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Applications</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Core AI Applications</h2>
            <div className="h-1 w-12 bg-green-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <img src={app.img} alt={app.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{app.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{app.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion Banner */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-2xl p-8 text-center shadow-md">
          <h3 className="text-lg font-bold mb-2">The Path Forward</h3>
          <p className="text-sm text-green-100 max-w-xl mx-auto leading-relaxed">
            AI is the key to sustainable farming and future food security. Krishi-Ai puts the power of intelligent agriculture in every farmer's hands.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhyAI;
