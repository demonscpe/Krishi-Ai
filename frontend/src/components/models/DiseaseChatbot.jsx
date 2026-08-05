import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { DiseaseContext } from '../../context/DiseaseContext';

export default function DiseaseChatbot() {
  const { plant, disease } = useContext(DiseaseContext);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your AI Plant Doctor. Ask me anything about plant diseases, treatments, or prevention.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const buildContext = () => {
    const ctx = {};
    if (plant) ctx.plant = plant;
    if (disease) ctx.disease = disease;
    return ctx;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/disease-chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: buildContext() }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Sorry, I could not process that.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-20 sm:pt-24 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex flex-wrap items-center gap-2 sm:gap-3 leading-tight">
            <Bot className="text-lime-300" /> AI Plant Doctor
          </h1>
          <p className="mt-2 text-sm text-emerald-50/80">Ask anything about plant diseases, treatments, and prevention.</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20 -mt-7">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          {/* Context Bar */}
          {(plant || disease) && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3 text-xs text-emerald-700 flex flex-wrap gap-2 sm:gap-4">
              {plant && <span>🌱 Plant: <strong>{plant}</strong></span>}
              {disease && <span>🦠 Disease: <strong>{disease}</strong></span>}
            </div>
          )}

          {/* Chat Messages */}
          <div className="h-[60vh] min-h-[400px] sm:h-[500px] overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'bot' && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Bot size={16} /></div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-emerald-700 text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-700 text-white"><User size={16} /></div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Bot size={16} /></div>
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about symptoms, treatment, prevention..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

