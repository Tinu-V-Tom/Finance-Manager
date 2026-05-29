import { NavLink } from 'react-router-dom';
import { Home, List, BarChart2, Wallet } from 'lucide-react';

const tabs = [
  { to: '/',             icon: Home,      label: 'Home'         },
  { to: '/transactions', icon: List,      label: 'Transactions' },
  { to: '/statistics',   icon: BarChart2, label: 'Statistics'   },
  { to: '/budget',       icon: Wallet,    label: 'Budget'       },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex z-50">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
