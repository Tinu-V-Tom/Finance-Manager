import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, PiggyBank, Plus, ChevronRight, AlertTriangle, Sun, Moon } from 'lucide-react';
import { useFinance, sumByType, filterMonth, monthKey, fmt, fmtDate } from '../store/useFinance';
import { useDark } from '../App';
import type { TxType } from '../types';

const TYPE_COLOR: Record<TxType, string> = {
  income:     'text-emerald-500',
  expense:    'text-red-500',
  investment: 'text-blue-400',
};

const TYPE_BG: Record<TxType, string> = {
  income:     'bg-emerald-50  border-emerald-100  dark:bg-emerald-950 dark:border-emerald-900',
  expense:    'bg-red-50      border-red-100      dark:bg-red-950     dark:border-red-900',
  investment: 'bg-blue-50    border-blue-100     dark:bg-blue-950    dark:border-blue-900',
};

const TYPE_BAR: Record<TxType, string> = {
  income: 'bg-emerald-400', expense: 'bg-red-400', investment: 'bg-blue-400',
};

export default function Home() {
  const { transactions, budgets } = useFinance();
  const { dark, toggle } = useDark();
  const mk = monthKey();

  const monthly    = useMemo(() => filterMonth(transactions, mk), [transactions, mk]);
  const income     = useMemo(() => sumByType(monthly, 'income'),     [monthly]);
  const expense    = useMemo(() => sumByType(monthly, 'expense'),    [monthly]);
  const investment = useMemo(() => sumByType(monthly, 'investment'), [monthly]);
  const balance    = income - expense - investment;

  const totalBudget = useMemo(() => budgets.find(b => b.category === 'Total'), [budgets]);
  const budgetPct   = totalBudget ? Math.min((expense / totalBudget.limit) * 100, 100) : null;
  const exceeded    = totalBudget ? expense > totalBudget.limit : false;

  const monthLabel = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="page-enter pb-24 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">{monthLabel}</p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Finance Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 active:scale-95 transition-transform"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/add"
            className="bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900 active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </Link>
        </div>
      </div>

      {/* Balance card */}
      <div className={`rounded-2xl p-5 mb-4 text-white shadow-lg ${balance >= 0 ? 'bg-gradient-to-br from-blue-700 to-blue-900' : 'bg-gradient-to-br from-red-600 to-red-900'}`}>
        <p className="text-blue-100 text-sm mb-1">Net Balance</p>
        <p className="text-4xl font-bold tracking-tight">{fmt(balance)}</p>
        {balance < 0 && (
          <div className="mt-2 flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 w-fit text-xs font-medium">
            <AlertTriangle size={12} /> Spending exceeds income
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <SummaryCard label="Income"   value={income}     icon={<TrendingUp size={16}  />} color="emerald" />
        <SummaryCard label="Expenses" value={expense}    icon={<TrendingDown size={16}/>} color="red"     />
        <SummaryCard label="Invested" value={investment} icon={<PiggyBank size={16}   />} color="blue"   />
      </div>

      {/* Budget strip */}
      {totalBudget && (
        <div className={`rounded-2xl border p-4 mb-4 ${exceeded ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Monthly Budget</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${exceeded ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400'}`}>
              {exceeded ? '▲ EXCEEDED' : '✓ ON TRACK'}
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full transition-all ${exceeded ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${budgetPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Spent {fmt(expense)}</span>
            <span className={exceeded ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
              {exceeded ? `Over by ${fmt(expense - totalBudget.limit)}` : `Left ${fmt(totalBudget.limit - expense)}`}
            </span>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Transactions</h2>
        <Link to="/transactions" className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
          See all <ChevronRight size={12} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No transactions yet.<br />
          <Link to="/add" className="text-blue-600 dark:text-blue-400 font-medium">Add your first one →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.slice(0, 6).map(t => (
            <div key={t.id} className={`flex items-center gap-3 rounded-xl border p-3 ${TYPE_BG[t.type]}`}>
              <div className={`w-2 h-10 rounded-full ${TYPE_BAR[t.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{t.category}</p>
                {t.note && <p className="text-xs text-slate-400 truncate">{t.note}</p>}
                <p className="text-xs text-slate-400 mt-0.5">{fmtDate(t.date)}</p>
              </div>
              <p className={`text-sm font-bold shrink-0 ${TYPE_COLOR[t.type]}`}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const styles: Record<string, { icon: string; amount: string; card: string }> = {
    emerald: { icon: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900', amount: 'text-emerald-600 dark:text-emerald-400', card: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' },
    red:     { icon: 'text-red-500     bg-red-50     dark:bg-red-900',     amount: 'text-red-500     dark:text-red-400',     card: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' },
    blue:    { icon: 'text-blue-600    bg-blue-50    dark:bg-blue-900',    amount: 'text-blue-600    dark:text-blue-400',    card: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' },
  };
  const s = styles[color];
  return (
    <div className={`rounded-2xl border p-3 flex flex-col gap-2 ${s.card}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.icon}`}>{icon}</div>
      <p className={`text-sm font-bold ${s.amount}`}>{fmt(value)}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
