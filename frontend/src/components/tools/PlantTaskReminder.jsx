import React, { useState, useEffect, useRef } from 'react';

const CAT_CONFIG = {
  water:     { label: 'Water',     icon: '💧', color: '#4EA8DE', bg: '#EAF4FD', dark: '#1A6FA3' },
  fertilize: { label: 'Fertilize', icon: '🌿', color: '#52B788', bg: '#E8F5EE', dark: '#1E6E45' },
  prune:     { label: 'Prune',     icon: '✂️', color: '#E76F51', bg: '#FDF0EC', dark: '#A83E22' },
  repot:     { label: 'Repot',     icon: '🪴', color: '#C77DFF', bg: '#F5EEFF', dark: '#7B2FBE' },
  other:     { label: 'Other',     icon: '📋', color: '#9BA2AE', bg: '#F2F3F5', dark: '#555E6B' },
};

const PRIORITY_CONFIG = {
  high:   { label: 'High',   dot: '#E63946' },
  normal: { label: 'Normal', dot: '#9BA2AE' },
  low:    { label: 'Low',    dot: '#4EA8DE' },
};

const REPEAT_OPTIONS = ['none', 'daily', 'weekly', 'monthly'];

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatRelative(dt) {
  const now = new Date();
  const diff = dt - now;
  const abs = Math.abs(diff);
  if (abs < 60000) return 'Now';
  if (diff < 0) {
    if (abs < 3600000) return `${Math.round(abs / 60000)}m overdue`;
    if (abs < 86400000) return `${Math.round(abs / 3600000)}h overdue`;
    return `${Math.round(abs / 86400000)}d overdue`;
  }
  if (diff < 3600000) return `In ${Math.round(diff / 60000)}m`;
  if (diff < 86400000) return `In ${Math.round(diff / 3600000)}h`;
  if (diff < 172800000) return `Tomorrow ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return `${dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : '1rem'})`,
      background: '#1A1F2E', color: '#fff', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
      padding: '10px 20px', borderRadius: '99px', opacity: visible ? 1 : 0,
      transition: 'all 0.25s ease', pointerEvents: 'none', zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      {message}
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '14px 16px',
      border: '1px solid #F0F2F5', flex: 1,
    }}>
      <div style={{ fontSize: '26px', fontWeight: 700, color: color || '#1A1F2E', fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: '#9BA2AE', marginTop: '4px', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, entering }) {
  const cc = CAT_CONFIG[task.cat];
  const pc = PRIORITY_CONFIG[task.priority];
  const overdue = !task.done && task.dt < new Date();

  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      border: `1px solid ${overdue ? '#FFD6D9' : '#F0F2F5'}`,
      borderLeft: overdue ? `4px solid #E63946` : task.done ? `4px solid #D1D9E0` : `4px solid ${cc.color}`,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      opacity: task.done ? 0.6 : 1,
      animation: entering ? 'slideIn 0.3s ease' : undefined,
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Check button */}   {/*    */}   {/*   */}   {/* Check button */}
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${task.done ? cc.color : '#D1D9E0'}`,
          background: task.done ? cc.color : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', outline: 'none',
        }}
      >
        {task.done && (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <polyline points="1.5,6 4.5,9 9.5,2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Cat icon pill */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '10px', background: cc.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px',
      }}>
        {cc.icon}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 500, color: task.done ? '#9BA2AE' : '#1A1F2E',
          textDecoration: task.done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {task.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
            color: overdue ? '#E63946' : '#9BA2AE',
          }}>
            {formatRelative(task.dt)}
          </span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
            background: cc.bg, color: cc.dark, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}>
            {cc.label}
          </span>
          {task.priority !== 'normal' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#9BA2AE', fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: pc.dot, display: 'inline-block' }} />
              {pc.label}
            </span>
          )}
          {task.repeat !== 'none' && (
            <span style={{ fontSize: '11px', color: '#9BA2AE', fontFamily: "'DM Sans', sans-serif" }}>↻ {task.repeat}</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        style={{
          width: '30px', height: '30px', border: 'none', background: 'transparent',
          borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#CBD3DC', transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; e.currentTarget.style.color = '#E63946'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#CBD3DC'; }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

const PlantTaskReminder = () => {
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [catFilter, setCatFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [newEntryId, setNewEntryId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const [form, setForm] = useState({
    name: '', cat: 'water', priority: 'normal', repeat: 'none',
    date: getTodayStr(), time: '09:00',
  });

  const timersRef = useRef({});

  const notify = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const scheduleReminder = (task) => {
    if (timersRef.current[task.id]) clearTimeout(timersRef.current[task.id]);
    const diff = task.dt - new Date();
    if (diff > 0) {
      timersRef.current[task.id] = setTimeout(() => notify(`🌿 Reminder: ${task.name}`), diff);
    }
  };

  useEffect(() => {
    const ref = timersRef.current;
    return () => Object.values(ref).forEach(clearTimeout);
  }, []);

  const addTask = () => {
    if (!form.name.trim() || !form.date || !form.time) {
      notify('Please fill in name, date and time.'); return;
    }
    const dt = new Date(`${form.date}T${form.time}`);
    const task = { id: Date.now(), name: form.name.trim(), cat: form.cat, priority: form.priority, repeat: form.repeat, dt, done: false };
    setTasks(prev => [...prev, task]);
    setNewEntryId(task.id);
    scheduleReminder(task);
    setForm(f => ({ ...f, name: '' }));
    notify('Task added');
    setTimeout(() => setNewEntryId(null), 400);
  };

  const toggleDone = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTask = (id) => {
    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    const task = tasks.find(t => t.id === id);
    if (task) setDeletedTasks(prev => [...prev, { ...task, deletedAt: new Date() }]);
    setTasks(prev => prev.filter(t => t.id !== id));
    notify('Task removed');
  };

  const filtered = tasks
    .filter(t => tab === 'upcoming' ? !t.done : tab === 'done' ? t.done : true)
    .filter(t => catFilter === 'all' || t.cat === catFilter)
    .sort((a, b) => a.dt - b.dt);

  const usedCats = ['all', ...Object.keys(CAT_CONFIG).filter(c => tasks.some(t => t.cat === c))];
  const overdueCount = tasks.filter(t => !t.done && t.dt < new Date()).length;

  const inputStyle = {
    height: '40px', borderRadius: '10px', border: '1px solid #E8ECF0',
    background: '#F7F9FB', color: '#1A1F2E', fontSize: '14px', padding: '0 12px',
    fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; }
        body { margin: 0; background: #F4F6FA; }
        input:focus, select:focus { border-color: #52B788 !important; box-shadow: 0 0 0 3px rgba(82,183,136,0.12); }
        .tab-btn { border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 6px 14px; border-radius: 99px; transition: all 0.15s; font-weight: 500; }
        .cat-chip { border: 1px solid #E8ECF0; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 4px 12px; border-radius: 99px; transition: all 0.15s; background: #fff; }
        .cat-chip:hover { border-color: #52B788; }
      `}</style>

     <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(160deg, #EAF5EF 0%, #F4F6FA 60%)', 
        padding: '120px 1rem 4rem', 
        fontFamily: "'DM Sans', sans-serif" 
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#52B788', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                🌱 Plant care
              </div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#1A1F2E', fontFamily: "'Fraunces', serif", lineHeight: 1.1, fontStyle: '' }}>
                Task Planner
              </h1>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              style={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#555E6B', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              History ({deletedTasks.length})
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <StatCard value={tasks.length} label="Total" />
            <StatCard value={tasks.filter(t => t.done).length} label="Done" color="#52B788" />
            <StatCard value={overdueCount} label="Overdue" color={overdueCount > 0 ? '#E63946' : '#9BA2AE'} />
          </div>

          {/* Form card */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '1.25rem', border: '1px solid #F0F2F5', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '12px' }}>
              <input
                style={{ ...inputStyle, background: '#fff', border: '1.5px solid #E8ECF0', fontSize: '15px', height: '44px' }}
                placeholder="What needs doing? e.g. Water the monstera"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addTask()}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {[
                { key: 'cat', options: Object.entries(CAT_CONFIG).map(([v, c]) => ({ value: v, label: `${c.icon} ${c.label}` })) },
                { key: 'priority', options: Object.entries(PRIORITY_CONFIG).map(([v, c]) => ({ value: v, label: c.label })) },
                { key: 'repeat', options: REPEAT_OPTIONS.map(v => ({ value: v, label: v === 'none' ? 'No repeat' : v.charAt(0).toUpperCase() + v.slice(1) })) },
              ].map(({ key, options }) => (
                <select key={key} style={inputStyle} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <input type="time" style={inputStyle} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <button
              onClick={addTask}
              style={{
                width: '100%', height: '44px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #52B788, #2D9B6A)',
                color: '#fff', fontSize: '15px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', letterSpacing: '0.02em', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              + Add Task
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#EAECF0', borderRadius: '99px', padding: '3px', marginBottom: '1rem' }}>
            {[['upcoming', 'Upcoming'], ['done', 'Completed'], ['all', 'All']].map(([value, label]) => (
              <button
                key={value}
                className="tab-btn"
                onClick={() => { setTab(value); setCatFilter('all'); }}
                style={{
                  flex: 1,
                  background: tab === value ? '#fff' : 'transparent',
                  color: tab === value ? '#1A1F2E' : '#9BA2AE',
                  boxShadow: tab === value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filters */}
          {usedCats.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {usedCats.map(c => (
                <button
                  key={c}
                  className="cat-chip"
                  onClick={() => setCatFilter(c)}
                  style={{
                    background: catFilter === c ? '#1A1F2E' : '#fff',
                    color: catFilter === c ? '#fff' : '#555E6B',
                    borderColor: catFilter === c ? '#1A1F2E' : '#E8ECF0',
                  }}
                >
                  {c === 'all' ? 'All' : `${CAT_CONFIG[c].icon} ${CAT_CONFIG[c].label}`}
                </button>
              ))}
            </div>
          )}

          {/* Task list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9BA2AE', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌱</div>
                No tasks here yet
              </div>
            ) : (
              filtered.map(t => (
                <TaskItem key={t.id} task={t} onToggle={toggleDone} onDelete={deleteTask} entering={t.id === newEntryId} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setShowHistory(false)}
        >
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '440px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: "'Fraunces', serif", color: '#1A1F2E', fontStyle: 'italic' }}>Task History</h2>
              <button onClick={() => setShowHistory(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#9BA2AE' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {deletedTasks.length === 0 ? (
                <p style={{ color: '#9BA2AE', fontSize: '14px', textAlign: 'center', padding: '2rem 0', fontFamily: "'DM Sans', sans-serif" }}>No deleted tasks yet.</p>
              ) : (
                deletedTasks.slice().reverse().map(t => {
                  const cc = CAT_CONFIG[t.cat];
                  return (
                    <div key={t.id + '-del'} style={{ background: '#F7F9FB', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ fontSize: '20px' }}>{cc.icon}</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#1A1F2E', fontFamily: "'DM Sans', sans-serif" }}>{t.name}</div>
                        <div style={{ fontSize: '12px', color: '#9BA2AE', fontFamily: "'DM Sans', sans-serif" }}>
                          Was due: {t.dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} · {cc.label}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {deletedTasks.length > 0 && (
              <button
                onClick={() => { setDeletedTasks([]); notify('History cleared'); }}
                style={{ marginTop: '16px', height: '40px', borderRadius: '10px', border: '1px solid #FFD6D9', background: '#FFF5F5', color: '#E63946', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Clear History
              </button>
            )}
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
};

export default PlantTaskReminder;