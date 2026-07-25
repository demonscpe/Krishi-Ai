import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaSeedling, FaBookOpen, FaTimes, FaComments } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/chatbot';

const QUICK_PROMPTS = [
  "What is Krishi-AI?",
  "How do I get started?",
  "How does crop recommendation work?",
  "How to detect plant diseases?",
];

const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ragStage, setRagStage] = useState('');
  const [expandedSources, setExpandedSources] = useState({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const toggleSources = (msgIndex) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  };

  const sendMessage = async (promptOverride) => {
    const message = (promptOverride ?? userPrompt).trim();
    if (!message || loading) return;

    setHasInteracted(true);
    const withUser = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(withUser);
    setUserPrompt('');
    setLoading(true);
    setRagStage('Searching knowledge base...');

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

      setChatHistory((prev) => [...prev, assistantMsg]);
    } catch {
      setChatHistory((prev) => [...prev, {
        role: 'assistant',
        content: "I couldn't reach the server. Make sure the Krishi-AI API is running.",
        sources: [],
        has_context: false,
      }]);
    } finally {
      setRagStage('');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat bubble button - fixed bottom-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-110'
            : 'bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <FaTimes size={22} /> : <FaComments size={22} />}
      </button>

      {/* Chat window panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-green-100 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 140px)', height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-700 to-emerald-600 text-white shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shadow-sm">
            <FaSeedling />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Krishi-AI RAG Agent</p>
            <p className="text-[10px] text-green-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block animate-pulse" />
              Online · Knowledge Base Active
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-green-50/30">
          {chatHistory.length === 0 && !hasInteracted && (
            <div className="text-center py-6 text-slate-400">
              <FaRobot size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-slate-500">Ask me anything about Krishi-AI!</p>
              <p className="text-[10px] mt-1 text-slate-400">I use RAG to search the knowledge base for accurate answers.</p>
            </div>
          )}

          {chatHistory.map((m, i) => (
            <div key={i}>
              <div className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700 text-xs mt-0.5">
                    <FaRobot />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : 'bg-white text-green-900 border border-green-100 rounded-bl-sm shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>

              {/* Sources */}
              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <div className="ml-8 mt-1">
                  <button
                    onClick={() => toggleSources(i)}
                    className="text-[10px] text-green-600 hover:text-green-700 flex items-center gap-1 cursor-pointer"
                  >
                    <FaBookOpen size={8} />
                    {expandedSources[i] ? 'Hide' : 'View'} sources ({m.sources.length})
                  </button>
                  {expandedSources[i] && (
                    <div className="mt-0.5 space-y-0.5">
                      {m.sources.map((src, j) => (
                        <div key={j} className="text-[9px] text-slate-500 flex items-center gap-1">
                          <span className="font-medium capitalize truncate max-w-[100px]">{src.source.replace(/-/g, ' ')}</span>
                          <span className="truncate max-w-[120px]">· {src.heading}</span>
                          <span className="text-green-500 shrink-0">({(src.relevance * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center text-green-700 text-xs">
                <FaRobot />
              </div>
              <div className="bg-white rounded-xl px-3 py-2 border border-green-100 shadow-sm">
                <div className="flex gap-1 items-center">
                  {[0, 0.2, 0.4].map((d, idx) => (
                    <span key={idx} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
                {ragStage && (
                  <p className="text-[10px] text-green-600 mt-1">{ragStage}</p>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-t border-green-100 bg-white shrink-0">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-green-100 bg-white shrink-0">
          <input
            ref={inputRef}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Krishi-AI anything..."
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50/50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Send"
          >
            <FaPaperPlane size={11} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AiChatbot;

