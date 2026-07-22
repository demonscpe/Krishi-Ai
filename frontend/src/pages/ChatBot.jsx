import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaSeedling } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/chatbot';

const QUICK_PROMPTS = [
  "How does equipment rental work?",
  "Is there training available?",
  "How do I create an account?",
  "Why use AI in agriculture?",
];

function ChatBot() {
  const [userPrompt, setUserPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const chatEndRef = useRef(null);
  const slowTimerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) setChatHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const persist = (history) => {
    setChatHistory(history);
    localStorage.setItem('chatHistory', JSON.stringify(history));
  };

  const sendMessage = async (promptOverride) => {
    const message = (promptOverride ?? userPrompt).trim();
    if (!message || loading) return;

    const withUser = [...chatHistory, { role: 'user', content: message }];
    persist(withUser);
    setUserPrompt('');
    setLoading(true);

    slowTimerRef.current = setTimeout(() => setSlowNotice(true), 8000);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message }),
      });
      const data = await res.json();
      persist([...withUser, { role: 'assistant', content: data.response || data.error || 'Something went wrong.' }]);
    } catch {
      persist([...withUser, { role: 'assistant', content: "I couldn't reach the server. Try again in a moment." }]);
    } finally {
      clearTimeout(slowTimerRef.current);
      setSlowNotice(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden flex flex-col h-[640px]">

        <div className="flex items-center gap-3 px-4 py-3 border-b border-green-100">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
            <FaSeedling />
          </div>
          <div>
            <p className="font-medium text-sm text-green-900">Krishi-AI agent</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {chatHistory.map((m, i) => (
            <div key={i} className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700 text-xs">
                  <FaRobot />
                </div>
              )}
              <div className={`rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-900'
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center text-green-700 text-xs">
                <FaRobot />
              </div>
              <div className="bg-green-50 rounded-xl px-3 py-2">
                <div className="flex gap-1 items-center">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
                {slowNotice && (
                  <p className="text-xs text-green-600 mt-1">Still thinking, this can take a little longer...</p>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2 px-3 py-2 overflow-x-auto border-t border-green-100">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-3 border-t border-green-100">
          <input
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Krishi-AI anything..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors"
            aria-label="Send"
          >
            <FaPaperPlane size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;