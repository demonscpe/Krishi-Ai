import React, { useState } from 'react';
import { FaGithub, FaDiscord, FaLinkedin, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Contactus from '../assets/contactus.png';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [responseMessage, setResponseMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || !/^[a-zA-Z\s]{3,}$/.test(form.name)) e.name = 'Name must be at least 3 letters';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.subject.trim() || !/^[a-zA-Z\s]{3,}$/.test(form.subject)) e.subject = 'Subject must be at least 3 letters';
    if (!form.message.trim() || form.message.length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('https://agrotech-ai-11j3.onrender.com/api/contactus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setResponseMessage(data.message || 'Message sent successfully!');
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setResponseMessage(''), 8000);
      } else {
        setErrorMsg(data.message || 'Failed to submit.');
        setTimeout(() => setErrorMsg(''), 8000);
      }
    } catch {
      setErrorMsg('There was an error sending your message.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-white text-gray-800 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-green-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 font-poppins">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Get In Touch</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Contact Us</h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
          <p className="mt-4 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Have questions or need help? We'd love to hear from you. Send us a message and we'll get back to you soon.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* Left — Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-green-800 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name</label>
                <input
                  type="text" placeholder="Your full name" className={inputClass('name')}
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email" placeholder="your@email.com" className={inputClass('email')}
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Subject</label>
                <input
                  type="text" placeholder="What's this about?" className={inputClass('subject')}
                  value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Message</label>
                <textarea
                  rows={5} placeholder="Your message..." className={inputClass('message')}
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              {responseMessage && <p className="text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-lg">{responseMessage}</p>}
              {errorMsg && <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">{errorMsg}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right — Info + Map */}
          <div className="space-y-6">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img src={Contactus} alt="Contact Us" className="w-full h-48 object-cover" />
            </div>

            {/* Contact Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <a href="mailto:info@krishi.com" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-green-300 transition-all">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-roboto">Email</p>
                  <p className="text-sm font-semibold text-gray-700">info@Krishi.com</p>
                </div>
              </a>

              <a href="tel:+911234567890" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-green-300 transition-all">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt className="text-green-600" size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-roboto">Phone</p>
                  <p className="text-sm font-semibold text-gray-700">+91 1234567890</p>
                </div>
              </a>

              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm sm:col-span-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-roboto">Address</p>
                  <p className="text-sm font-semibold text-gray-700">1-14 Krishi-Ai Lane, Madhapur, Hyderabad 533417</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-52">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13527.487707281556!2d78.3738297750517!3d17.449315703489304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9158f201b205%3A0x11bbe7be7792411b!2sMadhapur%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1728457656915!5m2!1sen!2sin"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Krishi Location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
