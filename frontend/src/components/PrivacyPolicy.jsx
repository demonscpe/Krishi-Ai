import { Link } from 'react-router-dom';
import React from 'react';

const sections = [
  { title: '1. Introduction', content: 'This Privacy Policy outlines how we collect, use, and protect your personal information when you use our agricultural services. By using our services, you consent to the practices described in this policy.' },
  { title: '2. Information We Collect', content: null, list: ['Personal identification information (Name, email address, etc.)', 'Data related to agricultural activities and soil quality', 'Technical information about your device and usage patterns'] },
  { title: '3. How We Use Your Information', content: 'The information we collect is used to improve our services, provide accurate soil quality predictions, and offer personalized guidelines for farmers. We may also use it to contact you regarding updates or changes to our services.' },
  { title: '4. Data Sharing and Disclosure', content: 'We do not share your personal information with third parties unless required by law or to protect our rights and services. In such cases, we will take all necessary steps to ensure your data is protected.' },
  { title: '5. Data Security', content: 'We implement security measures to protect your data from unauthorized access, alteration, or disclosure. However, no system is completely secure and we cannot guarantee absolute security of your information.' },
  { title: '6. Your Rights', content: 'You have the right to access, correct, or delete the personal data we hold about you. If you wish to exercise these rights, please contact us.' },
  { title: '7. Changes to this Policy', content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we encourage you to review it periodically.' },
  { title: '8. Contact Us', content: null, address: { name: 'Krishi-Ai', email: 'privacy@krishi.com', phone: '+91 1234567890' } },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 font-poppins">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Legal</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Privacy Policy</h1>
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
