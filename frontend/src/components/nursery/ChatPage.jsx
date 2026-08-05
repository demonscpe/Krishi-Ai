import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Store } from 'lucide-react';
import { useNursery } from '../../context/NurseryContext';

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nurseryDetail } = useNursery();
  const [messages, setMessages] = useState([
    { from: 'nursery', text: 'Hello 👋 Welcome to our nursery! How can we help you today?' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: 'me', text: input.trim() }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'nursery', text: 'Thanks for reaching out! Our team will get back to you shortly.' }]);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 transition-colors flex flex-col">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft size={20} /></button>
          <div className="flex-1 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20"><Store size={18} /></span>
            <div>
              <p className="font-bold text-sm leading-tight">{nurseryDetail?.nurseryName || 'Nursery'}</p>
              <p className="text-[11px] text-emerald-100/80">Usually replies within an hour</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 py-5 flex-1 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.from === 'me' ? 'bg-green-600 text-white rounded-br-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-md'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </main>

      <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={send} className="p-3 rounded-xl bg-green-600 text-white hover:bg-green-700"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
