import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
function formatRelative(dtStr) {
  const dt = new Date(dtStr);
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
function Toast({ message, visible, type }) {
  const bgColor = type === 'error' ? '#E63946' : '#1A1F2E';
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : '1rem'})`,
      background: bgColor, color: '#fff', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
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
    <div style={{ background: '#fff', borderRadius: '14px', padding: '14px 16px', border: '1px solid #F0F2F5', flex: 1 }}>
      <div style={{ fontSize: '26px', fontWeight: 700, color: color || '#1A1F2E', fontFamily: "'Fraunces', serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9BA2AE', marginTop: '4px', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
    </div>
  );
}

const TaskItem = ({ task, onToggle, onDelete, entering }) => {
  const cc = CAT_CONFIG[task.cat] || CAT_CONFIG.other;
  const pc = PRIORITY_CONFIG[task.priority];
  const isOverdue = !task.done && new Date(task.dt) < new Date();

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: `1px solid ${isOverdue ? '#FFD6D9' : '#F0F2F5'}`,
      borderLeft: isOverdue ? `4px solid #E63946` : task.done ? `4px solid #D1D9E0` : `4px solid ${cc.color}`,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', opacity: task.done ? 0.6 : 1,
      animation: entering ? 'slideIn 0.3s ease' : undefined, transition: 'all 0.2s',
    }}>
      <button onClick={() => onToggle(task.id)} style={{
          width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer',
          border: `2px solid ${task.done ? cc.color : '#D1D9E0'}`, background: task.done ? cc.color : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none',
        }}>
        {task.done && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><polyline points="1.5,6 4.5,9 9.5,2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: cc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>{cc.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: task.done ? '#9BA2AE' : '#1A1F2E', textDecoration: task.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Sans', sans-serif" }}>
          {task.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: isOverdue ? '#E63946' : '#9BA2AE' }}>{formatRelative(task.dt)}</span>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: cc.bg, color: cc.dark, fontWeight: 500 }}>{cc.label}</span>
          {task.notes && <span style={{ fontSize: '11px', color: '#9BA2AE', fontStyle: 'italic' }}>• {task.notes}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#CBD3DC' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
};

const MainTaskReminder = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('irrigationTasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [catFilter, setCatFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [newEntryId, setNewEntryId] = useState(null);
  const [toastMsg, setToastMsg] = useState({ visible: false, message: '', type: 'success' });
  const [form, setForm] = useState({
    name: '', cat: 'water', priority: 'normal', repeat: 'none',
    date: getTodayStr(), time: '09:00', to: '', notes: ''
  });
  const timersRef = useRef({});
  useEffect(() => {
    localStorage.setItem('irrigationTasks', JSON.stringify(tasks));
    tasks.forEach(task => { if (!task.done) scheduleNotification(task); });
  }, [tasks]);
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  const notify = (msg, type = 'success') => {
    setToastMsg({ visible: true, message: msg, type });
    setTimeout(() => setToastMsg(t => ({ ...t, visible: false })), 3000);
  };

  const scheduleNotification = (task) => {
    if (timersRef.current[task.id]) clearTimeout(timersRef.current[task.id]);
    const taskTime = new Date(task.dt).getTime();
    const diff = taskTime - Date.now();
    if (diff > 0) {
      timersRef.current[task.id] = setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Plant Care Reminder', { body: `Time for ${task.name}!`, icon: '🌿' });
        }
        sendEmailNotification(task, 'reminder');
      }, diff);
    }
  };
  const sendEmailNotification = async (task, action) => {
    if (!task.to) return;
    try {
      await axios.post('/api/send-email', {
        to: task.to,
        subject: `Plant Task ${action.toUpperCase()}: ${task.name}`,
        body: `${task.name} scheduled for ${task.dt}. Notes: ${task.notes || 'None'}`,
      });
    } catch (e) { console.error('Email error:', e); }
  };
  const handleAddTask = async () => {
    if (!form.name || !form.date || !form.time || !form.to) {
      notify('Please fill required fields (Name, Date, Time, Email)', 'error');
      return;
    }
    const dt = `${form.date}T${form.time}`;
    const newTask = { id: Date.now(), ...form, dt, done: false };
    
    setTasks(prev => [...prev, newTask]);
    setNewEntryId(newTask.id);
    await sendEmailNotification(newTask, 'created');
    setForm({ ...form, name: '', notes: '' });
    notify('Task added and email sent!');
    setTimeout(() => setNewEntryId(null), 400);
  };

  const toggleDone = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) setDeletedTasks(prev => [...prev, { ...task, deletedAt: new Date() }]);
    setTasks(prev => prev.filter(t => t.id !== id));
    notify('Task removed');
  };

  // --- FILTERING ---
  const filtered = tasks
    .filter(t => tab === 'upcoming' ? !t.done : tab === 'done' ? t.done : true)
    .filter(t => catFilter === 'all' || t.cat === catFilter)
    .sort((a, b) => new Date(a.dt) - new Date(b.dt));

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
        body { margin: 0; background: #F4F6FA; }
        .tab-btn { border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 6px 14px; border-radius: 99px; transition: all 0.15s; font-weight: 500; }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #EAF5EF 0%, #F4F6FA 60%)', padding: '120px 1rem 4rem', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#52B788', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>🌱 Smart Agriculture</div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#1A1F2E', fontFamily: "'Fraunces', serif" }}>Irrigation Planner</h1>
            </div>
            <button onClick={() => setShowHistory(true)} style={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer' }}>
              History ({deletedTasks.length})
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <StatCard value={tasks.length} label="Total" />
            <StatCard value={tasks.filter(t => t.done).length} label="Done" color="#52B788" />
            <StatCard value={tasks.filter(t => !t.done && new Date(t.dt) < new Date()).length} label="Overdue" color="#E63946" />
          </div>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '1.25rem', border: '1px solid #F0F2F5', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
            <input 
              style={{ ...inputStyle, background: '#fff', border: '1.5px solid #E8ECF0', height: '44px', marginBottom: '12px' }} 
              placeholder="Crop Name (e.g. Wheat Irrigation)" 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <select style={inputStyle} value={form.cat} onChange={e => setForm({...form, cat: e.target.value})}>
                {Object.entries(CAT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <input style={inputStyle} type="email" placeholder="Recipient Email" value={form.to} onChange={e => setForm({...form, to: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              <input type="time" style={inputStyle} value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            </div>
            <textarea 
              style={{ ...inputStyle, height: '60px', padding: '10px', marginBottom: '14px', resize: 'none' }} 
              placeholder="Notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} 
            />
            <button onClick={handleAddTask} style={{ width: '100%', height: '44px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #52B788, #2D9B6A)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              + Schedule Task
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: '#EAECF0', borderRadius: '99px', padding: '3px', marginBottom: '1rem' }}>
            {['upcoming', 'done', 'all'].map(v => (
              <button key={v} className="tab-btn" onClick={() => setTab(v)} style={{ flex: 1, background: tab === v ? '#fff' : 'transparent', color: tab === v ? '#1A1F2E' : '#9BA2AE' }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9BA2AE' }}>No tasks found</div>
            ) : (
              filtered.map(t => <TaskItem key={t.id} task={t} onToggle={toggleDone} onDelete={deleteTask} entering={t.id === newEntryId} />)
            )}
          </div>
        </div>
      </div>
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowHistory(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '90%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
             <h2 style={{ fontFamily: "'Fraunces', serif" }}>History</h2>
             {deletedTasks.map(t => <div key={t.id} style={{ fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #eee' }}>{t.name} - {t.cat}</div>)}
             <button onClick={() => setShowHistory(false)} style={{ width: '100%', marginTop: '15px', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}>Close</button>
          </div>
        </div>
      )}
      <Toast message={toastMsg.message} visible={toastMsg.visible} type={toastMsg.type} />
    </>
  );
};
export default MainTaskReminder;