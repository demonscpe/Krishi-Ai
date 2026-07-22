import React from 'react';
import aboutus from '../assets/aboutus.png';
import bgHero from "../assets/bgHero.png";
import editor from "../assets/editor.png";
import about from '../assets/about.png';

function AboutUs() {
  return (
    <div 
      className="w-full py-16 px-4 font-poppins" 
      style={{ 
        backgroundImage: `url(${bgHero})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed' 
      }}
    >
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="flex flex-col items-center">
          <div className="text-center mb-12">
            <p className="text-green-600 font-bold tracking-widest uppercase text-xs mb-2 font-roboto">
              About Krishi-Ai
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2 leading-tight">
              Empowering Farmers with AI-Driven Solutions
            </h2>
            <div className="h-1 w-24 bg-green-600 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="relative group">
              <div className="absolute -inset-1 bg-green-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-700"></div>
              <img
                className="relative w-full rounded-lg shadow-lg hover:scale-[1.02] transition-transform duration-300 bg-white"
                src={about}
                alt="About Krishi-Ai"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-l-4 border-green-600 shadow-sm">
                <h3 className="text-lg font-semibold text-green-700 mb-2">🌟 Our Mission</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  We aim to empower farmers with innovative solutions that harness the power of AI, 
                  enabling them to achieve better yields, reduce waste, and promote sustainable farming practices.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                <h3 className="text-lg font-semibold text-green-700 mb-2">🤔 How it Works!</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">✔</span> 
                    Access machine learning models for crop prediction and soil analysis.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">✔</span> 
                    Make informed decisions on crop management and pest control.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-green-800 mb-6">Our Philosophy</h2>
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <p className="bg-white/60 p-4 rounded-lg border-l-4 border-green-400">
                ✅ We empower stakeholders across the agricultural ecosystem by providing data-driven 
                solutions that increase efficiency and improve yields.
              </p>
              <p className="bg-white/60 p-4 rounded-lg border-l-4 border-green-400">
                ✅ We believe technology should be accessible to all, collaborating closely with agronomists 
                to develop practical, user-friendly tools.
              </p>
              <p className="bg-white/60 p-4 rounded-lg border-l-4 border-green-400">
                ✅ From family farms to commercial operations, our tech is scalable and adaptable 
                to any environment.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img 
              className="w-full rounded-xl shadow-xl border-4 border-white transition-transform hover:rotate-1" 
              src={aboutus} 
              alt="Our Philosophy" 
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center pb-10">
          <div>
            <img 
              className="w-full rounded-xl shadow-xl grayscale hover:grayscale-0 transition-all duration-500" 
              src={editor} 
              alt="Future Vision" 
            />
          </div>
          <div className="bg-green-800 text-white p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">The Future of Agriculture</h2>
            <p className="text-sm text-green-100 leading-relaxed mb-4">
              At Krishi-Ai, we are dedicated to creating a future where agriculture is not only 
              more efficient but also more resilient to climate change.
            </p>
            <p className="text-sm text-green-100 leading-relaxed">
              Through innovation and a deep commitment to the farming community, we are determined 
              to build a more sustainable and prosperous agricultural future for all.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutUs;