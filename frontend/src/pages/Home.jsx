import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

// Assets
import heroImage from '../assets/hero.jpg';

// Components
import Features from '../components/Features';
import About from './About';
import Showcase from '../components/Showcase';
import TestimonialSlider from '../components/TestimonialSlider';
import FAQ from '../components/FAQ';
import AdvantagesDisadvantages from '../components/AdvDis'; 

// External Libraries
import { FaComment } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context & Styles
import "../styles/ChatbotButton.css";
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [protectedRedirectPath, setProtectedRedirectPath] = useState('/chatbot');

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const openLoginPrompt = (redirectPath = '/chatbot') => {
    setProtectedRedirectPath(redirectPath);
    setShowLoginPrompt(true);
  };

  const handleChatBotAuthentication = () => {
    if (isLoggedIn) {
      navigate('/chatbot');
    } else {
      openLoginPrompt('/chatbot');
    }
  };

  const handlePromptContinue = () => {
    setShowLoginPrompt(false);
    navigate('/login', { state: { from: protectedRedirectPath } });
  };

  const handlePromptBack = () => {
    setShowLoginPrompt(false);
  };

  return (
    <div className="relative min-h-screen bg-white font-poppins text-slate-900">
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar
        newestOnTop
        closeOnClick
        className="mt-16"
      />

      {/* --- HERO SECTION --- */}
      {/* Reduced padding from pt-20/pb-16 to pt-12/pb-10 */}
      <section className="relative pt-20 pb-10 md:pb-16 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Title increased to 38px exactly */}
            <h1 className="text-[38px] font-extrabold tracking-tight text-slate-900 leading-tight">
              <span className="block mb-1">Welcome to Krishi-Ai</span>
              <span className="block text-green-700">Intelligent Farming Starts Here</span>
            </h1>
            
            {/* Reduced vertical margin on the separator */}
            <div className="h-1.5 w-24 bg-green-500 mx-auto my-6 rounded-full"></div>
            
            <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-medium">
              Empowering precision farming through intelligent insights that boost productivity while protecting natural resources.
            </p>

            <div className="mt-8 flex justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/products"
                  className="flex items-center justify-center px-10 py-3.5 text-sm font-bold text-white bg-green-700 hover:bg-green-800 rounded-full shadow-lg transition-all duration-300 uppercase tracking-widest"
                >
                  Explore Now
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Image Section - Reduced top margin */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 relative flex justify-center"
          >
            <div className="absolute -inset-4 bg-green-100 rounded-full blur-3xl opacity-40"></div>
            <img
              src={heroImage}
              alt="Krishi-Ai Dashboard"
              className="relative w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100"
            />
          </motion.div>
        </div>
      </section>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Login to Continue</h2>
            <p className="text-sm text-slate-600 mb-6">
              You need to login before using this feature. Choose Continue to sign in, or Back to stay on the homepage.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handlePromptContinue}
                className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 transition"
              >
                Continue
              </button>
              <button
                onClick={handlePromptBack}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HOW IT WORKS SECTION --- */}
      {/* Reduced padding from py-16 to py-12 */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Get Started</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 tracking-tight">
              How It Works?
            </h2>
            <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-700 rounded-full font-black text-xl mb-6">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Understand Your Field</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We collect important information about your soil, weather conditions, and crop growth.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-500 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-700 rounded-full font-black text-xl mb-6">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Smart Farming Insights</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our AI studies your farm data and identifies problems early to help you make better decisions.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-400 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-700 rounded-full font-black text-xl mb-6">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Grow with Confidence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get clear recommendations on irrigation and fertilizers to increase yield and reduce waste.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- ADDITIONAL COMPONENTS --- */}
      <div className="bg-white">
        <Features />
        <About />
        <Showcase />
        <AdvantagesDisadvantages />
        <TestimonialSlider />
        <FAQ />
      </div>

      {/* --- FLOATING CHATBOT BUTTON --- */}
      <button 
        onClick={handleChatBotAuthentication}
        className="fixed bottom-8 right-8 p-5 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
      >
        <FaComment size={24} />
      </button>
    </div>
  );
}