import { useState, useEffect } from 'react';
import type { Reminder, Recurrence } from '../types';

function load(): Reminder[] {
  try {
    const raw = localStorage.getItem('ft_reminders');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

let _reminders: Reminder[] = load();
let _listeners: (() => void)[] = [];
function notify() { _listeners.forEach(f => f()); }

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(_reminders);

  useEffect(() => {
    const fn = () => setReminders([..._reminders]);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(f => f !== fn); };
  }, []);

  function addReminder(r: Omit<Reminder, 'id'>) {
    const item: Reminder = { ...r, id: Date.now().toString(36) + Math.random().toString(36).slice(2) };
    _reminders = [item, ..._reminders];
    localStorage.setItem('ft_reminders', JSON.stringify(_reminders));
    notify();
  }

  function deleteReminder(id: string) {
    _reminders = _reminders.filter(r => r.id !== id);
    localStorage.setItem('ft_reminders', JSON.stringify(_reminders));
    notify();
  }

  // Advance a recurring reminder to its next due date after being triggered
  function advanceReminder(id: string) {
    _reminders = _reminders.map(r => {
      if (r.id !== id) return r;
      if (r.recurrence === 'once') return r; // handled by delete
      const next = nextDueDate(r.dueDate, r.recurrence);
      return { ...r, dueDate: next };
    });
    localStorage.setItem('ft_reminders', JSON.stringify(_reminders));
    notify();
  }

  return { reminders, addReminder, deleteReminder, advanceReminder };
}

export function nextDueDate(from: string, recurrence: Recurrence): string {
  const d = new Date(from + 'T00:00:00');
  if (recurrence === 'weekly')  d.setDate(d.getDate() + 7);
  if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
  if (recurrence === 'yearly')  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function dueStatus(dueDate: string): 'overdue' | 'today' | 'upcoming' {
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return 'upcoming';
}
