import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Image as ImageIcon, Loader2, ArrowLeft, Sparkles,
  CheckCircle2, Leaf, Send, Trash2, Bot
} from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

/**
 * Shared base page for the 4 new AI soil vision modules.
 *
 * Each module: upload a soil image -> AI vision analysis -> ask follow-up
 * questions to the soil assistant chat.
 *
 * Props:
 *   title       - Page title
 *   subtitle    - Short description shown in hero
 *   mode        - Backend mode key (detection|health_analysis|health_rating|visual_analysis)
 *   badge       - Small label above the title (e.g. "AI vision analysis")
 *   accent      - Tailwind color key (e.g. "blue") used for buttons/highlights
 *   features    - List of feature bullets shown in the right sidebar before analysis
 *   howItWorks  - [stepTitle, stepDesc, ...] triples shown in the bottom info section
 *   backTo      - Route to go back (default "/soil")
 */
const SoilVisionBase = ({
  title,
  subtitle,
  mode,
  badge = 'AI vision analysis',
  accent = 'blue',
  features = [],
  howItWorks = [],
  backTo = '/soil',
}) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const accentMap = {
    blue:   { badge: 'bg-blue-50 text-blue-600', icon: 'bg-blue-100 text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20', focus: 'focus:border-blue-500 focus:ring-blue-100', side: 'bg-blue-900', sideText: 'text-blue-50/80', sideAccent: 'text-blue-200' },
    amber:  { badge: 'bg-amber-50 text-amber-600', icon: 'bg-amber-100 text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20', focus: 'focus:border-amber-500 focus:ring-amber-100', side: 'bg-amber-900', sideText: 'text-amber-50/80', sideAccent: 'text-amber-200' },
    emerald:{ badge: 'bg-emerald-50 text-emerald-600', icon: 'bg-emerald-100 text-emerald-600', btn: 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20', focus: 'focus:border-emerald-500 focus:ring-emerald-100', side: 'bg-emerald-900', sideText: 'text-emerald-50/80', sideAccent: 'text-emerald-200' },
    rose:   { badge: 'bg-rose-50 text-rose-600', icon: 'bg-rose-100 text-rose-600', btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20', focus: 'focus:border-rose-500 focus:ring-rose-100', side: 'bg-rose-900', sideText: 'text-rose-50/80', sideAccent: 'text-rose-200' },
  };
  const ac = accentMap[accent] || accentMap.blue;

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB.');
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
    setResult(null);
    setMessages([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
      setMessages([]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setMessages([]);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('mode', mode);

      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/soil-vision/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.result },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to analyze soil image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setMessages([]);
  };

  const handleChatSend = async () => {
    const message = chatInput.trim();
    if (!message || isChatLoading) return;

    const userMsg = { role: 'user', text: message };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const base = import.meta.env.VITE_CROP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/soil-vision/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          message,
          context: result?.result || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Chat failed (${res.status})`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: `Error: ${err.message || 'Failed to get response.'}` },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  const renderMessageText = (text) => {
    // Light formatting: preserve line breaks, bold **text**
    const escaped = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: escaped }} />;
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate(backTo)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Soil Hub
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> {badge}
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left: Upload & Preview */}
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-start gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${ac.icon}`}><Camera size={22} /></div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Image upload</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">Upload soil photograph</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">Clear, well-lit photos yield the best results.</p>
              </div>
            </div>

            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 transition-all hover:border-blue-400 hover:bg-blue-50/30"
              >
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-100">
                  <Upload className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-base font-bold text-slate-700">Click to upload or drag & drop</p>
                <p className="mt-1 text-sm text-slate-400">PNG, JPG, JPEG up to 10MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img src={preview} alt="Soil preview" className="w-full h-72 object-cover" />
                  <button
                    onClick={resetAnalysis}
                    className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    Change image
                  </button>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className={`group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${ac.btn}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Analyzing soil...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={18} /> Analyze Soil
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Chat panel */}
            {result && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <Bot size={16} className="text-emerald-600" /> Soil Assistant
                  </div>
                  <button onClick={clearChat} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} /> Clear
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-3 p-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-emerald-700 text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                        }`}
                      >
                        {renderMessageText(msg.text)}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-400 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 p-3 border-t border-slate-200 bg-white">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
                    placeholder="Ask about your soil..."
                    className={`flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-4 ${ac.focus}`}
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={isChatLoading || !chatInput.trim()}
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${ac.btn}`}
                  >
                    <Send size={17} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Right: Info / Result summary */}
          <aside className={`relative overflow-hidden ${ac.side} p-6 text-white sm:p-8 lg:p-10`}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/60" />
            <img src={bgHero} className="absolute inset-0 h-full w-full object-cover opacity-20" alt="" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
                <Leaf size={14} className="text-lime-300" /> Analysis insights
              </div>

              {result ? (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-extrabold">Analysis complete</h3>
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">Mode</p>
                    <p className="mt-1 text-lg font-extrabold capitalize">{mode.replace('_', ' ')}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4 max-h-64 overflow-y-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Key findings</p>
                    <p className="text-sm leading-relaxed text-white/90 line-clamp-6">{result.result}</p>
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="mt-2 w-full rounded-xl bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    Analyze another image
                  </button>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">How it works</p>
                  <h3 className="mt-3 text-2xl font-extrabold leading-tight">Upload a soil photo for instant AI analysis.</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Our AI vision engine analyzes the photo and returns detailed insights. Then chat with the soil
                    assistant for personalized recommendations.
                  </p>
                  {features.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-sm text-white/90">
                          <CheckCircle2 size={14} className="text-lime-300 shrink-0" /> {feat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom info */}
        {howItWorks.length > 0 && !result && (
          <div className="mt-8 bg-gradient-to-br from-emerald-700 to-green-600 rounded-3xl p-8 sm:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles size={14} className="text-lime-300" /> How it works
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                {howItWorks.map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-black mb-3">
                      {item.step}
                    </div>
                    <h4 className="text-base font-extrabold mb-1">{item.title}</h4>
                    <p className="text-sm text-emerald-50/80">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SoilVisionBase;

