import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, Clock, CheckCircle2, Trash2, Plus, ArrowLeft, Sparkles, Leaf, Droplets, Scissors, RefreshCw, AlertCircle } from 'lucide-react';
import bgHero from "../../assets/bgHero.png";

const CAT_CONFIG = {
  water:     { label: 'Watering', icon: Droplets, color: 'bg-blue-500', lightBg: 'bg-blue-50', lightText: 'text-blue-600' },
  fertilize: { label: 'Fertilize', icon: Leaf, color: 'bg-green-500', lightBg: 'bg-green-50', lightText: 'text-green-600' },
  prune:     { label: 'Pruning', icon: Scissors, color: 'bg-orange-500', lightBg: 'bg-orange-50', lightText: 'text-orange-600' },
  repot:     { label: 'Repotting', icon: RefreshCw, color: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-600' },
  other:     { label: 'Other', icon: AlertCircle, color: 'bg-slate-500', lightBg: 'bg-slate-50', lightText: 'text-slate-600' },
};

const PlantTaskReminder = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('plantTasks')) || []; }
    catch { return []; }
  });
  const [deletedTasks, setDeletedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('plantTasksDeleted')) || []; }
    catch { return []; }
  });
  const [tab, setTab] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newEntryId, setNewEntryId] = useState(null);
  const [form, setForm] = useState({
    name: '', cat: 'water', priority: 'normal', repeat: 'none',
    date: new Date().toISOString().slice(0, 10), time: '09:00',
  });
  const [toast, setToast] = useState({ visible: false, message: '' });

  useEffect(() => { localStorage.setItem('plantTasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('plantTasksDeleted', JSON.stringify(deletedTasks)); }, [deletedTasks]);

  const notify = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const addTask = () => {
    if (!form.name.trim() || !form.date || !form.time) {
      notify('Please fill in name, date and time.'); return;
    }
    const dt = `${form.date}T${form.time}`;
    const task = { id: Date.now(), name: form.name.trim(), cat: form.cat, priority: form.priority, repeat: form.repeat, dt, done: false, createdAt: new Date().toISOString() };
    setTasks(prev => [...prev, task]);
    setNewEntryId(task.id);
    setForm(f => ({ ...f, name: '' }));
    notify('Task added');
    setTimeout(() => setNewEntryId(null), 400);
  };

  const toggleDone = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) setDeletedTasks(prev => [...prev, { ...task, deletedAt: new Date().toISOString() }]);
    setTasks(prev => prev.filter(t => t.id !== id));
    notify('Task removed');
  };

  const restoreTask = (id) => {
    const task = deletedTasks.find(t => t.id === id);
    if (task) {
      setTasks(prev => [...prev, { ...task, done: false }]);
      setDeletedTasks(prev => prev.filter(t => t.id !== id));
      notify('Task restored');
    }
  };

  const filtered = tasks
    .filter(t => tab === 'upcoming' ? !t.done : tab === 'done' ? t.done : true)
    .sort((a, b) => new Date(a.dt) - new Date(b.dt));

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    overdue: tasks.filter(t => !t.done && new Date(t.dt) < new Date()).length,
  };

  return (
    <div className="w-full min-h-screen bg-[#f7faf8] pt-16 sm:pt-20 font-sans">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${bgHero})` }} />
        <div className="absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
              <Sparkles size={14} className="text-lime-300" /> Plant care scheduling
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Plant Task Planner
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">
              Schedule watering, fertilizing, pruning, and repotting tasks for your plants with reminders.
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="-mt-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-emerald-950/10 p-6 sm:p-8">
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { value: stats.total, label: 'Total Tasks', color: 'text-slate-800', bg: 'bg-slate-50' },
                { value: stats.done, label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
                { value: stats.overdue, label: 'Overdue', color: 'text-red-600', bg: 'bg-red-50' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl p-4 text-center border border-slate-100`}>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Add Task Button & History */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all shadow-md">
                <Plus size={18} /> {showForm ? 'Close' : 'Add Task'}
              </button>
              <button onClick={() => setShowHistory(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Trash2 size={16} /> History ({deletedTasks.length})
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Task name (e.g. Water the tomato plants)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <select value={form.cat} onChange={(e) => setForm(f => ({ ...f, cat: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-500">
                    {Object.entries(CAT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={form.repeat} onChange={(e) => setForm(f => ({ ...f, repeat: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-500">
                    <option value="none">No repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-500" />
                  <input type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-500" />
                </div>
                <button onClick={addTask}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 text-sm font-bold text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-md">
                  <Plus size={18} className="inline mr-1" /> Schedule Task
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {[['upcoming', 'Upcoming'], ['done', 'Completed'], ['all', 'All']].map(([value, label]) => (
                <button key={value} onClick={() => setTab(value)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === value ? 'bg-green-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No tasks found</p>
                  <p className="text-sm">Add your first plant care task to get started.</p>
                </div>
              ) : (
                filtered.map(task => {
                  const cc = CAT_CONFIG[task.cat] || CAT_CONFIG.other;
                  const Icon = cc.icon;
                  const isOverdue = !task.done && new Date(task.dt) < new Date();
                  return (
                    <div
                      key={task.id}
                      className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg ${task.done ? 'bg-slate-50 border-slate-200' : isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}
                    >
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleDone(task.id)}
                          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'}`}>
                          {task.done && <CheckCircle2 size={14} className="text-white" />}
                        </button>
                        <div className={`p-2.5 rounded-xl ${cc.lightBg}`}>
                          <Icon size={20} className={cc.lightText} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.name}</h4>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                              <Clock size={12} className="inline mr-1" />
                              {new Date(task.dt).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(task.dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cc.lightBg} ${cc.lightText}`}>{cc.label}</span>
                            {task.repeat !== 'none' && (
                              <span className="text-xs text-slate-400"><RefreshCw size={11} className="inline mr-0.5" />{task.repeat}</span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)}
                          className="shrink-0 p-2 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowHistory(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">Task History</h2>
            {deletedTasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No deleted tasks.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {deletedTasks.slice().reverse().map(t => {
                  const cc = CAT_CONFIG[t.cat] || CAT_CONFIG.other;
                  const Icon = cc.icon;
                  return (
                    <div key={t.id + '-del'} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={`p-1.5 rounded-lg ${cc.lightBg}`}><Icon size={14} className={cc.lightText} /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{t.name}</p>
                        <p className="text-xs text-slate-400">{cc.label} · {t.dt ? new Date(t.dt).toLocaleDateString() : ''}</p>
                      </div>
                      <button onClick={() => restoreTask(t.id)}
                        className="text-xs font-bold text-green-600 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all">
                        Restore
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => setShowHistory(false)}
              className="w-full mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-slate-800 text-white text-sm font-medium px-6 py-3 rounded-full shadow-lg">
          {toast.message}
        </div>
      </div>
    </div>
  );
};

export default PlantTaskReminder;
