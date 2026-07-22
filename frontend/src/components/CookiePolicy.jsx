import { Link } from 'react-router-dom';
import React from 'react';
const sections = [
  { title: '1. What Are Cookies', content: 'Cookies are small pieces of data stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.' },
  { title: '2. How We Use Cookies', content: 'We use cookies for the following purposes:', list: ['Personalized soil quality predictions and farming guidelines', 'Remember your preferences and settings', 'Improve performance and functionality of our website', 'Analyze how our website is used to improve our services'] },
  { title: '3. Types of Cookies We Use', content: null, types: [
    { name: 'Essential Cookies', desc: 'Necessary for the website to function properly and cannot be switched off.' },
    { name: 'Analytical Cookies', desc: 'Help us understand how visitors interact with our website to improve functionality.' },
    { name: 'Functionality Cookies', desc: 'Remember choices you make to improve your experience.' },
    { name: 'Targeting Cookies', desc: 'Collect browsing data to deliver relevant and personalized content.' },
  ]},
  { title: '4. Third-Party Cookies', content: 'We may use third-party cookies such as Google Analytics to analyze site usage. These third-party cookies are subject to their own privacy policies.' },
  { title: '5. Managing Cookies', content: 'Most web browsers allow you to control cookies through settings preferences. Limiting cookies may affect your experience on our website.' },
  { title: '6. Changes to Cookie Policy', content: 'We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.' },
  { title: '7. Contact Us', content: null, address: { name: 'Krishi-Ai', email: 'privacy@krishi.com', phone: '+91 1234567890' } },
];
export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 font-poppins">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Legal</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Cookie Policy</h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-green-600 to-emerald-400" />
          <div className="p-8 space-y-8">
            {sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-base font-bold text-green-800 mb-2">{s.title}</h2>
                {s.content && <p className="text-sm text-slate-600 leading-relaxed">{s.content}</p>}
                {s.list && (
                  <ul className="mt-2 space-y-1">
                    {s.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.types && (
                  <div className="mt-3 space-y-3">
                    {s.types.map((t, j) => (
                      <div key={j} className="bg-green-50 rounded-xl p-3 border border-green-100">
                        <p className="text-sm font-semibold text-green-700 mb-0.5">{t.name}</p>
                        <p className="text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                {s.address && (
                  <address className="mt-2 not-italic text-sm text-slate-600 space-y-1">
                    <p className="font-semibold text-green-700">{s.address.name}</p>
                    <p>Email: {s.address.email}</p>
                    <p>Phone: {s.address.phone}</p>
                  </address>
                )}
              </section>
            ))}
          </div>
          <div className="bg-green-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
