import React, { useState } from "react";
import { BiChevronUp } from 'react-icons/bi';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqCount, setFaqCount] = useState(6);

  const faqs = [
  {
    question: "What is Krishi-Ai?",
    answer: "Krishi-Ai is a precision agriculture platform that leverages machine learning and IoT data to help farmers optimize yields and manage resources through data-driven insights."
  },
  {
    question: "How do drones assist in smart farming?",
    answer: "Drones provide high-resolution aerial mapping and multispectral imaging to monitor crop health, detect pest infestations early, and manage irrigation with extreme precision."
  },
  {
    question: "What data points are needed for soil analysis?",
    answer: "Our models analyze nitrogen, phosphorus, potassium (NPK) levels, pH values, moisture content, and organic carbon to recommend the most suitable crops for your land."
  },
  {
    question: "Is training provided for the AI tools?",
    answer: "Yes, we provide comprehensive tutorials and technical resources to help farmers effectively utilize our drone services, precision tools, and AI dashboards."
  },
  {
    question: "How does the platform handle data security?",
    answer: "Data security is our top priority. We use end-to-end encryption and secure blockchain-ready servers to protect all farm data and user information."
  },
  {
    question: "Can I access real-time weather forecasts?",
    answer: "Absolutely. Krishi-Ai integrates real-time meteorological data to provide hyper-local weather updates, helping you plan sowing and harvesting schedules."
  },

  // --- Additional Questions ---
  {
    question: "How accurate are crop yield predictions?",
    answer: "Our AI models use historical and real-time data to deliver highly accurate yield predictions, helping farmers plan storage and sales efficiently."
  },
  {
    question: "Can I monitor multiple farms from one dashboard?",
    answer: "Yes, the platform allows you to manage multiple fields and farms from a single unified dashboard."
  },
  {
    question: "Does Krishi-Ai support organic farming?",
    answer: "Yes, we provide recommendations tailored for organic farming practices, including natural fertilizers and pest control methods."
  },
  {
    question: "How does pest detection work?",
    answer: "AI analyzes images from drones and cameras to identify pest patterns and alerts farmers early for preventive action."
  },
  {
    question: "Can I get irrigation recommendations?",
    answer: "Yes, the system suggests optimal irrigation schedules based on soil moisture, weather, and crop type."
  },
  {
    question: "Is Krishi-Ai suitable for small-scale farmers?",
    answer: "Absolutely, our platform is scalable and designed to benefit both small and large farms."
  },
  {
    question: "Does it support regional languages?",
    answer: "Yes, the platform supports multiple regional languages for ease of use."
  },
  {
    question: "Can I track fertilizer usage?",
    answer: "Yes, the system logs fertilizer usage and suggests optimized quantities."
  },
  {
    question: "How does AI improve crop quality?",
    answer: "AI ensures optimal resource usage, leading to healthier crops and better yields."
  },
  {
    question: "Does the platform provide market price insights?",
    answer: "Yes, farmers receive real-time market trends and pricing insights."
  },
  {
    question: "Can I get alerts for extreme weather?",
    answer: "Yes, instant alerts are sent for storms, droughts, and temperature changes."
  },
  {
    question: "Is internet required to use the platform?",
    answer: "Most features require internet, but some offline capabilities are available."
  },
  {
    question: "Does it support greenhouse farming?",
    answer: "Yes, Krishi-Ai supports greenhouse monitoring and automation."
  },
  {
    question: "How are recommendations personalized?",
    answer: "Recommendations are based on soil data, crop history, and environmental conditions."
  },
  {
    question: "Can I export farm reports?",
    answer: "Yes, you can download detailed reports in PDF and CSV formats."
  },
  {
    question: "Does the platform integrate with government schemes?",
    answer: "Yes, it provides updates and eligibility insights for agricultural schemes."
  },
  {
    question: "How secure is my farm data?",
    answer: "All data is encrypted and stored securely with strict privacy policies."
  },
  {
    question: "Can AI detect nutrient deficiencies?",
    answer: "Yes, it identifies deficiencies through soil and crop analysis."
  },
  {
    question: "Is there customer support available?",
    answer: "Yes, we offer 24/7 customer support via chat and call."
  },
  {
    question: "Does it support livestock farming?",
    answer: "Basic livestock monitoring features are included."
  },
  {
    question: "How often is data updated?",
    answer: "Data is updated in real-time or at regular intervals depending on sensors."
  },
  {
    question: "Can I integrate third-party sensors?",
    answer: "Yes, Krishi-Ai supports multiple IoT device integrations."
  },
  {
    question: "Does it provide crop rotation advice?",
    answer: "Yes, AI suggests optimal crop rotation strategies."
  },
  {
    question: "How does AI reduce farming costs?",
    answer: "It optimizes inputs like water, fertilizers, and pesticides."
  },
  {
    question: "Can I monitor farm activities remotely?",
    answer: "Yes, all farm data can be accessed remotely via mobile or web."
  },
  {
    question: "Is there a mobile app available?",
    answer: "Yes, Krishi-Ai is available on both Android and iOS." // ... rest of your FAQ data
     }
];

  const loadMoreFAQs = () => setFaqCount(prev => Math.min(prev + 3, faqs.length));

  return (
    <section className="py-12 bg-white font-poppins">
      <div className="max-w-2xl mx-auto px-5">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Support</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Frequently Asked Questions</h2>
          <div className="h-1 w-12 bg-green-600 mx-auto rounded-full" />
        </div>

        <div className="space-y-4">
          {faqs.slice(0, faqCount).map((faq, i) => (
            <div key={i} className="border-b border-green-100">
              <button
                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                className="flex justify-between items-center w-full py-4 text-left group"
              >
                <span className={`font-semibold transition-colors ${activeIndex === i ? 'text-green-700' : 'text-slate-800'}`}>
                  {faq.question}
                </span>
                <BiChevronUp className={`w-5 h-5 transform transition-transform ${activeIndex === i ? 'rotate-180 text-green-700' : 'text-slate-400'}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${activeIndex === i ? 'max-h-40 mb-4' : 'max-h-0'}`}>
                <p className="text-sm text-slate-600 leading-relaxed opacity-90">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {faqCount < faqs.length && (
          <div className="text-center mt-10">
            <button
              onClick={loadMoreFAQs}
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-green-700 transition-colors"
            >
              + Load More Questions
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;