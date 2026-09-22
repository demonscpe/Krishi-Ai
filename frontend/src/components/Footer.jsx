import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedinIn, FaInstagram, FaEnvelope, FaLeaf } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaRegCopyright } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import icon from '../assets/Krishi-logo.svg';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const companyLinks = [
    { name: 'About Us', path: '/aboutus' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Contributors', path: '/contributor' },
    { name: 'Why AI?', path: '/whyai' },
  ];
  const quickLinks = [
    { name: 'Crop Recommendation', path: '/crop' },
    { name: 'Fertilizer Recommendation', path: '/fertilizer' },
    { name: 'Soil Quality', path: '/soil' },
    { name: 'Price Prediction', path: '/prices' },
    { name: 'Climate Forecast', path: '/Climate' },
    { name: 'Disease Detection', path: '/disease' },
    // Discussion Forum link removed
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookie-policy' },
    { name: 'Code of Conduct', path: '/code-of-conduct' },
    { name: 'License', path: '/licensing' },
  ];
  const socialMedia = [
    { Icon: FaGithub, link: 'https://github.com/IRajesh1209', label: 'GitHub', bg: 'hover:bg-gray-800' },
    { Icon: FaLinkedinIn, link: 'https://www.linkedin.com/in/rajesh1209', label: 'LinkedIn', bg: 'hover:bg-blue-600' },
    { Icon: FaInstagram, link: 'https://instagram.com/rajesh.inw', label: 'Instagram', bg: 'hover:bg-pink-600' },
    {
      Icon: FaEnvelope,
      link: 'mailto:rajesh.in1209@gmail.com?subject=Contact from Krishi-AI&body=Hello Rajesh,%0A%0AI would like to connect with you regarding...',
      label: 'Gmail',
      bg: 'hover:bg-red-500',
    },
  ];
  const submitRating = async () => {
    if (rating === 0) { toast.warn('Please select a star rating.'); return; }
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const token = authData?.token;
    if (!token) { toast.error('Please log in to submit a rating.'); return; }
    try {
      const response = await fetch('https://agrotech-ai-11j3.onrender.com/api/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      if (response.ok) {
        toast.success('Thank you for your feedback!');
        setRating(0); setComment(''); setIsModalOpen(false);
      } else {
        const err = await response.json();
        toast.error(err.message || 'Submission failed.');
      }
    } catch { toast.error('An error occurred.'); }
  };
  return (
    <>
      <footer className="bg-[#0d1f12] text-white font-poppins">
        {/* Top Green Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-green-600 via-emerald-400 to-green-600" />
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Col 1 — Brand */}
            <div className="space-y-5">
              <Link
                to="/"
                onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); window.location.reload(); } }}
                className="inline-flex items-center gap-3 group"
              >
                <img src={icon} alt="Krishi Logo" className="h-10 w-auto object-contain" />
              </Link>

              <p className="text-sm text-gray-400 leading-relaxed">
                Empowering agriculture through cutting-edge AI, machine learning models, and real-time data insights for every farmer.
              </p>

              {/* Social Icons */}
              <div className="flex gap-3 pt-1">
                {socialMedia.map(({ Icon, link, label, bg }) => (
                  <a
                    key={label}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 ${bg} hover:scale-110`}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
            {/* Col 2 — Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-5">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((l) => (
                  <li key={l.name}>
                    <Link
                      to={l.path}
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-150 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-green-700 group-hover:bg-green-400 transition-colors" />
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((l) => (
                  <li key={l.name}>
                    <Link
                      to={l.path}
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-150 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-green-700 group-hover:bg-green-400 transition-colors" />
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-5">Legal</h4>
              <ul className="space-y-3 mb-8">
                {legalLinks.map((l) => (
                  <li key={l.name}>
                    <Link
                      to={l.path}
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-150 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-green-700 group-hover:bg-green-400 transition-colors" />
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaLeaf size={13} />
                Rate Our Platform
              </button>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <FaRegCopyright size={11} />
              <span>{currentYear} Krishi-Ai. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaLeaf size={11} className="text-green-600" />
              <span>Built with ❤️ for farmers everywhere</span>
            </div>
          </div>
        </div>
      </footer>
      {/* Rating Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-6 text-white text-center">
              <FaLeaf size={28} className="mx-auto mb-2 opacity-80" />
              <h2 className="text-xl font-bold font-poppins">Rate Krishi-Ai</h2>
              <p className="text-green-100 text-sm mt-1">Your feedback helps us grow</p>
            </div>

            <div className="p-6">
              {/* Stars */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setRating(v)}
                    onMouseEnter={() => setHoveredStar(v)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className={`text-4xl transition-all duration-100 hover:scale-125 ${
                      (hoveredStar || rating) >= v ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <p className="text-center text-sm text-gray-500 mb-4 -mt-2">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </p>
              )}

              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-4"
                placeholder="Share your experience with us..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={submitRating}
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => { setIsModalOpen(false); setRating(0); setHoveredStar(0); setComment(''); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
