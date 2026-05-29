import { createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Statistics from './pages/Statistics';
import Budget from './pages/Budget';
import Reminders from './pages/Reminders';
import { useDarkMode } from './store/useDarkMode';
import { useReminders, dueStatus } from './store/useReminders';
import { showNotification } from './utils/notifications';

interface DarkCtx { dark: boolean; toggle: () => void; }
export const DarkContext = createContext<DarkCtx>({ dark: false, toggle: () => {} });
export const useDark = () => useContext(DarkContext);

function WithNav({ children }: { children: React.ReactNode }) {
  return <>{children}<BottomNav /></>;
}

function ReminderChecker() {
  const { reminders } = useReminders();

  useEffect(() => {
    if (Notification.permission !== 'granted') return;
    reminders.forEach(r => {
      const status = dueStatus(r.dueDate);
      if (status === 'overdue' || status === 'today') {
        const label = status === 'today' ? 'Due Today' : 'Overdue';
        showNotification(
          `${label}: ${r.title}`,
          `₹${r.amount.toLocaleString('en-IN')} · ${r.recurrence !== 'once' ? r.recurrence : 'one time'}`
        );
      }
    });
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App() {
  const { dark, toggle } = useDarkMode();

  return (
    <DarkContext.Provider value={{ dark, toggle }}>
      <ReminderChecker />
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<WithNav><Home /></WithNav>} />
          <Route path="/transactions" element={<WithNav><Transactions /></WithNav>} />
          <Route path="/add"          element={<AddTransaction />} />
          <Route path="/statistics"   element={<WithNav><Statistics /></WithNav>} />
          <Route path="/budget"       element={<WithNav><Budget /></WithNav>} />
          <Route path="/reminders"    element={<WithNav><Reminders /></WithNav>} />
        </Routes>
      </BrowserRouter>
    </DarkContext.Provider>
  );
}
