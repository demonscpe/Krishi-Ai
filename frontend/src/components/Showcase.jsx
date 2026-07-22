import React from 'react';
import editor from "../assets/prediction.webp";

const Showcase = () => {
  const editorData = {
    title: "Our Precision AI Models",
    subheading: "Advanced Analytics for Modern Agriculture",
    features: [
      {
        title: "Soil & Yield Forecasting",
        description:
          "Leverage state-of-the-art machine learning to analyze soil health and predict crop yields with high precision. Stay ahead of environmental changes with proactive data insights.",
      },
      {
        title: "Intelligent Pest Monitoring",
        description:
          "Identify potential pest outbreaks before they spread. Our models process real-time data to provide early warning signs, reducing chemical waste and protecting your harvest.",
      },
    ],
  };
  return (
    <section className="bg-white py-16 font-poppins">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>AI Models</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 tracking-tight">
            {editorData.title}
          </h2>
          <div className="h-1 w-16 bg-green-600 mx-auto mb-3 rounded-full" />
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {editorData.subheading}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <div className="lg:w-1/2 space-y-6">
            {editorData.features.map((feature, index) => (
              <div
                key={index}
                className="bg-green-50 p-6 rounded-lg shadow-sm border-l-4 border-green-600 transition-all duration-300 hover:shadow-md hover:bg-white"
              >
                <div className="flex gap-3 mb-2">
                  <span className="text-green-600 font-bold">✔</span>
                  <h3 className="text-lg font-semibold text-green-800">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed ml-6">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          <div className="lg:w-1/2 flex justify-center w-full">
            <div className="relative group w-full max-w-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
              <img
                src={editor}
                alt="AI Prediction Models Dashboard"
                className="relative w-full h-auto rounded-xl shadow-xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>
        <div className="mt-12 bg-green-700 text-white rounded-lg p-5 text-center shadow-md">
          <h3 className="text-sm font-semibold mb-1">
            Data-Driven Excellence
          </h3>
          <p className="text-xs text-green-100">
            Empowering farmers with predictive intelligence for a sustainable future.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Showcase;