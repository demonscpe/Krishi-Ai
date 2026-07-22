import { Link } from 'react-router-dom';
import React from 'react';

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using our agricultural services, including soil quality prediction and farmer guidelines, you agree to be bound by these Terms and Conditions. If you disagree with any part, you may not access our services.' },
  { title: '2. Use of Services', content: 'Our services are intended to provide information and predictions to assist farmers. You acknowledge that:', list: ['Predictions are based on available data and may not be 100% accurate.', 'Use our services as a supplement to, not replacement for, professional advice.', 'We are not responsible for crop losses resulting from use of our services.'] },
  { title: '3. User Accounts', content: 'To access certain features, you may need to create an account. You are responsible for maintaining confidentiality of your account and password, and accept responsibility for all activities that occur under your account.' },
  { title: '4. Data Privacy', content: 'We collect and use your data in accordance with our Privacy Policy. By using our services, you consent to such processing and warrant that all data provided by you is accurate.' },
  { title: '5. Intellectual Property', content: 'The content, features, and functionality of our service are owned by us and protected by international copyright, trademark, patent, and other intellectual property laws.' },
  { title: '6. Termination', content: 'We may terminate or suspend your account immediately, without prior notice, under our sole discretion, for any reason including breach of these Terms.' },
  { title: '7. Changes to Terms', content: 'We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to new terms taking effect.' },
  { title: '8. Contact Us', content: null, address: { name: 'Krishi-Ai', email: 'legal@krishi.com', phone: '+91 1234567890' } },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 font-poppins">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Legal</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Terms & Conditions</h1>
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
