import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Trash2, Bot, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const SUGGESTIONS = [
  { text: "Recommend best crops for this season", icon: "🌱" },
  { text: "How do I manage soil pH levels?", icon: "🧪" },
  { text: "What's the weather forecast for today?", icon: "🌤️" },
  { text: "Identify common plant diseases", icon: "🔍" },
];

const GeminiChat = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('geminiChat')) || []; }
    catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('geminiChat', JSON.stringify(messages));
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    const userMsg = { role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/generate-content/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `User query: ${msg}\nNote: Return ONLY the HTML body tags content.` }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      const content = data.generatedText || 'Sorry, I could not process that request.';
      setMessages(prev => [...prev, { role: 'assistant', text: content }]);
    } catch {
      const fallbacks = [
        "I'd recommend planting Rice, Wheat, or Maize this season based on your region.",
        "To manage soil pH, add lime to raise pH or sulfur to lower it. Test your soil first.",
        "Based on current data, expect moderate temperatures with a chance of rain in farming regions.",
        "Common plant diseases include powdery mildew, leaf spot, and blight. Early detection is key!",
      ];
      const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setMessages(prev => [...prev, { role: 'assistant', text: `<p>${fallback}</p>` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> AI farming assistant
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Krishi AI Chat
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Ask any farming-related question — crop recommendations, soil management, pest control, and more.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-50">
                  <Bot size={22} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Krishi AI Chat</h3>
                  <p className="text-xs text-slate-400">AI-powered farming assistant</p>
                </div>
              </div>
              <button onClick={() => { setMessages([]); localStorage.removeItem('geminiChat'); }}
                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                <Trash2 size={18} />
              </button>
            </div>

            <div ref={chatRef} className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="p-4 rounded-2xl bg-green-50 mb-4">
                    <Bot size={48} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">Let's chat! What's on your mind?</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md">Choose from the prompts below or ask your own farming questions.</p>
                  <div className="grid grid-cols-2 gap-3 max-w-lg">
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => handleSend(s.text)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm font-medium text-slate-700 hover:border-green-400 hover:bg-green-50 transition-all">
                        <span>{s.icon}</span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200'}`}>
                      {msg.role === 'assistant' ? (
                        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text }} />
                      ) : (
                        <p className="text-sm">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-4 border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 size={16} className="animate-spin" /> Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4 bg-white">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something about farming..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100" />
                <button type="submit" disabled={!input.trim() || isLoading}
                  className="rounded-xl bg-green-600 p-3 text-white hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeminiChat;

