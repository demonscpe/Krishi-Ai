import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaSeedling, FaBookOpen, FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/chatbot';

const QUICK_PROMPTS = [
  "What is Krishi-AI?",
  "How do I get started?",
  "How does crop recommendation work?",
  "How to detect plant diseases?",
];

function ChatBot() {
  const [userPrompt, setUserPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const [ragStage, setRagStage] = useState('');
  const [expandedSources, setExpandedSources] = useState({});
  const chatEndRef = useRef(null);
  const slowTimerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('ragChatHistory');
    if (saved) setChatHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const persist = (history) => {
    setChatHistory(history);
    localStorage.setItem('ragChatHistory', JSON.stringify(history));
  };

  const toggleSources = (msgIndex) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  };

  const sendMessage = async (promptOverride) => {
    const message = (promptOverride ?? userPrompt).trim();
    if (!message || loading) return;

    const withUser = [...chatHistory, { role: 'user', content: message }];
    persist(withUser);
    setUserPrompt('');
    setLoading(true);
    setRagStage('Searching knowledge base...');

    slowTimerRef.current = setTimeout(() => setRagStage('Still searching, this may take a moment...'), 6000);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message }),
      });
      const data = await res.json();

      const assistantMsg = {
        role: 'assistant',
        content: data.response || data.error || 'Something went wrong.',
        sources: data.sources || [],
        has_context: data.has_context || false,
      };

      persist([...withUser, assistantMsg]);
    } catch {
      persist([...withUser, {
        role: 'assistant',
        content: "I couldn't reach the server. Make sure the Krishi-AI API is running on http://localhost:8000",
        sources: [],
        has_context: false,
      }]);
    } finally {
      clearTimeout(slowTimerRef.current);
      setSlowNotice(false);
      setRagStage('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden flex flex-col h-[640px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-green-100">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white shadow-sm">
            <FaSeedling />
          </div>
          <div>
            <p className="font-medium text-sm text-green-900">Krishi-AI RAG Agent</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Online · Knowledge Base Active
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {chatHistory.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <FaRobot size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Ask me anything about Krishi-AI!</p>
              <p className="text-xs mt-1">I use RAG to search the knowledge base for accurate answers.</p>
            </div>
          )}

          {chatHistory.map((m, i) => (
            <div key={i}>
              <div className={`flex gap-2 max-w-[88%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
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

              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <div className="ml-8 mt-1">
                  <button
                    onClick={() => toggleSources(i)}
                    className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 cursor-pointer"
                  >
                    <FaBookOpen size={10} />
                    {expandedSources[i] ? 'Hide' : 'View'} sources ({m.sources.length})
                  </button>
                  {expandedSources[i] && (
                    <div className="mt-1 space-y-0.5">
                      {m.sources.map((src, j) => (
                        <div key={j} className="text-[10px] text-slate-500 flex items-center gap-1">
                          <FaSearch size={8} />
                          <span className="font-medium capitalize">{src.source.replace(/-/g, ' ')}</span>
                          <span>· {src.heading}</span>
                          <span className="text-green-500">({(src.relevance * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                {ragStage && (
                  <p className="text-xs text-green-600 mt-1">{ragStage}</p>
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

