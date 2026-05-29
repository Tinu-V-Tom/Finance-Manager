import { useState, useMemo } from 'react';
import { Bell, Plus, Trash2, ChevronUp, BellOff } from 'lucide-react';
import { useReminders, dueStatus, nextDueDate } from '../store/useReminders';
import { requestPermission } from '../utils/notifications';
import { fmt } from '../store/useFinance';
import type { Recurrence } from '../types';

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  once: 'One time', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
};

const STATUS_STYLE = {
  overdue:  { bg: 'bg-red-50    dark:bg-red-950    border-red-200    dark:border-red-800',    badge: 'bg-red-100    dark:bg-red-900    text-red-600    dark:text-red-400',    dot: 'bg-red-500'     },
  today:    { bg: 'bg-amber-50  dark:bg-amber-950  border-amber-200  dark:border-amber-800',  badge: 'bg-amber-100  dark:bg-amber-900  text-amber-600  dark:text-amber-400',  dot: 'bg-amber-500'   },
  upcoming: { bg: 'bg-white     dark:bg-slate-800  border-slate-100  dark:border-slate-700',  badge: 'bg-slate-100  dark:bg-slate-700  text-slate-500  dark:text-slate-400',  dot: 'bg-slate-300'   },
};

const STATUS_LABEL = { overdue: 'Overdue', today: 'Due Today', upcoming: 'Upcoming' };

export default function Reminders() {
  const { reminders, addReminder, deleteReminder, advanceReminder } = useReminders();
  const [showForm, setShowForm]     = useState(false);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState(Notification.permission === 'granted');

  // Form state
  const [title, setTitle]         = useState('');
  const [amount, setAmount]       = useState('');
  const [category, setCategory]   = useState('Bills');
  const [dueDate, setDueDate]     = useState(new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState<Recurrence>('monthly');
  const [note, setNote]           = useState('');

  const sorted = useMemo(() =>
    [...reminders].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [reminders]
  );

  async function handleEnableNotifications() {
    const granted = await requestPermission();
    setNotifGranted(granted);
  }

  function handleSave() {
    if (!title.trim() || !amount || parseFloat(amount) <= 0 || !dueDate) return;
    addReminder({ title: title.trim(), amount: parseFloat(amount), category, dueDate, recurrence, note });
    setTitle(''); setAmount(''); setNote('');
    setDueDate(new Date().toISOString().slice(0, 10));
    setRecurrence('monthly');
    setShowForm(false);
  }

  function handleMarkPaid(id: string, rec: Recurrence) {
    if (rec === 'once') {
      deleteReminder(id);
    } else {
      advanceReminder(id);
    }
  }

  return (
    <div className="page-enter pb-24 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reminders</h1>
          <p className="text-xs text-slate-400 mt-0.5">Payment & bill due dates</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900 active:scale-95 transition-transform"
        >
          {showForm ? <ChevronUp size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Notification permission banner */}
      {!notifGranted && (
        <button
          onClick={handleEnableNotifications}
          className="w-full mb-4 flex items-center gap-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Enable Notifications</p>
            <p className="text-xs text-blue-500 dark:text-blue-400">Get alerted when payments are due</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Enable →</span>
        </button>
      )}

      {notifGranted && (
        <div className="flex items-center gap-2 mb-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
          <Bell size={14} className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Notifications are enabled</p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">New Reminder</h2>

          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Title (e.g. Rent, EMI, Netflix)" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-500" />

            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                <span className="text-slate-400 text-sm font-bold">₹</span>
                <input type="number" inputMode="decimal" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)}
                  className="flex-1 text-sm text-slate-700 dark:text-slate-200 outline-none bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-500" />
              </div>
              <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-500" />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2.5">
                <label className="text-xs text-slate-400 block mb-0.5">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full text-sm text-slate-700 dark:text-slate-200 outline-none bg-transparent" />
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2.5">
                <label className="text-xs text-slate-400 block mb-0.5">Repeat</label>
                <select value={recurrence} onChange={e => setRecurrence(e.target.value as Recurrence)}
                  className="w-full text-sm text-slate-700 dark:text-slate-200 outline-none bg-transparent">
                  {(Object.entries(RECURRENCE_LABELS) as [Recurrence, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-500" />

            <button onClick={handleSave} disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm active:scale-95 transition-all disabled:opacity-40">
              Save Reminder
            </button>
          </div>
        </div>
      )}

      {/* Reminders list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <BellOff size={40} strokeWidth={1.2} />
          <p className="text-sm">No reminders yet</p>
          <button onClick={() => setShowForm(true)} className="text-blue-600 dark:text-blue-400 text-sm font-medium">
            Add your first reminder →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(r => {
            const status = dueStatus(r.dueDate);
            const s = STATUS_STYLE[status];
            const daysText = getDaysText(r.dueDate);
            const nextDate = r.recurrence !== 'once' ? nextDueDate(r.dueDate, r.recurrence) : null;

            return (
              <div key={r.id} className={`rounded-2xl border p-4 ${s.bg}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${s.dot}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</p>
                      {r.category && <p className="text-xs text-slate-400">{r.category}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                      {STATUS_LABEL[status]}
                    </span>
                    <button onClick={() => setConfirmId(r.id)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{fmt(r.amount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.dueDate} · {daysText}
                    </p>
                    {r.recurrence !== 'once' && (
                      <p className="text-xs text-slate-400">{RECURRENCE_LABELS[r.recurrence]} · next: {nextDate}</p>
                    )}
                    {r.note && <p className="text-xs text-slate-400 italic mt-0.5">{r.note}</p>}
                  </div>
                  {(status === 'overdue' || status === 'today') && (
                    <button
                      onClick={() => handleMarkPaid(r.id, r.recurrence)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold active:scale-95 transition-all"
                    >
                      {r.recurrence === 'once' ? 'Mark Paid' : 'Paid ✓'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-[480px] p-5">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Delete reminder?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
              <button onClick={() => { deleteReminder(confirmId); setConfirmId(null); }} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDaysText(dueDate: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate === today) return 'Due today';
  const diff = Math.round((new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} overdue`;
  return `in ${diff} day${diff > 1 ? 's' : ''}`;
}
