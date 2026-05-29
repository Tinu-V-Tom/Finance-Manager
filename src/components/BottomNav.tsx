import { NavLink } from 'react-router-dom';
import { Home, List, BarChart2, Wallet, Bell } from 'lucide-react';
import { useReminders, dueStatus } from '../store/useReminders';

const tabs = [
  { to: '/',             icon: Home,      label: 'Home'         },
  { to: '/transactions', icon: List,      label: 'Transactions' },
  { to: '/statistics',   icon: BarChart2, label: 'Stats'        },
  { to: '/budget',       icon: Wallet,    label: 'Budget'       },
  { to: '/reminders',    icon: Bell,      label: 'Reminders'    },
];

export default function BottomNav() {
  const { reminders } = useReminders();
  const dueCount = reminders.filter(r => {
    const s = dueStatus(r.dueDate);
    return s === 'overdue' || s === 'today';
  }).length;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex z-50">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors relative ${
              isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {label === 'Reminders' && dueCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {dueCount > 9 ? '9+' : dueCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
