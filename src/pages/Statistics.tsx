import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useFinance, filterMonth, sumByType, fmt, monthKey } from '../store/useFinance';
import { useDark } from '../App';
import type { TxType } from '../types';

const TYPE_COLORS: Record<TxType, string> = {
  income: '#10b981', expense: '#ef4444', investment: '#3b82f6',
};

const EXPENSE_PALETTE = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#8b5cf6','#ec4899','#64748b',
];

export default function Statistics() {
  const { transactions } = useFinance();
  const { dark } = useDark();
  const [offset, setOffset] = useState(0);

  const mk = useMemo(() => monthKey(offset), [offset]);
  const label = useMemo(() => {
    const [y, m] = mk.split('-');
    return new Date(+y, +m - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  }, [mk]);

  const monthly    = useMemo(() => filterMonth(transactions, mk), [transactions, mk]);
  const income     = useMemo(() => sumByType(monthly, 'income'),     [monthly]);
  const expense    = useMemo(() => sumByType(monthly, 'expense'),    [monthly]);
  const investment = useMemo(() => sumByType(monthly, 'investment'), [monthly]);

  const pieData = [
    { name: 'Income',   value: income     },
    { name: 'Expenses', value: expense    },
    { name: 'Invested', value: investment },
  ].filter(d => d.value > 0);

  const expByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthly.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthly]);

  const barData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const mk2 = monthKey(-(5 - i));
      const [, m] = mk2.split('-');
      const mo = filterMonth(transactions, mk2);
      return {
        month: new Date(2000, +m - 1).toLocaleString('en-IN', { month: 'short' }),
        Income:  sumByType(mo, 'income'),
        Expense: sumByType(mo, 'expense'),
      };
    });
  }, [transactions]);

  const axisColor  = dark ? '#475569' : '#cbd5e1';
  const labelColor = dark ? '#94a3b8' : '#64748b';
  const gridColor  = dark ? '#1e293b' : '#f1f5f9';
  const tooltipBg  = dark ? '#1e293b' : '#ffffff';
  const tooltipBdr = dark ? '#334155' : '#e2e8f0';

  return (
    <div className="page-enter pb-24 px-4 pt-6">
      {/* Month nav — clear prev/next with current month label */}
      <div className="flex items-center gap-2 mb-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-1">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-1.5">
          <CalendarDays size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        </div>

        <button
          onClick={() => setOffset(o => Math.min(o + 1, 0))}
          disabled={offset === 0}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 active:scale-95 transition-all"
        >
          <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {offset < 0 && (
        <button
          onClick={() => setOffset(0)}
          className="w-full mb-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-100 dark:border-blue-900"
        >
          ↩ Back to current month
        </button>
      )}

      {/* Overview pills */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {([['Income', income, '#10b981'], ['Expenses', expense, '#ef4444'], ['Invested', investment, '#3b82f6']] as [string, number, string][]).map(([l, v, c]) => (
          <div key={l} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">{l}</p>
            <p className="text-sm font-bold" style={{ color: c }}>{fmt(v)}</p>
          </div>
        ))}
      </div>

      {/* Pie chart */}
      {pieData.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={Object.values(TYPE_COLORS)[i]} />)}
              </Pie>
              <Tooltip
                formatter={(v) => fmt(Number(v))}
                contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBdr}`, borderRadius: 10, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: Object.values(TYPE_COLORS)[i] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 mb-4 text-center text-slate-400 text-sm">
          No data for this month
        </div>
      )}

      {/* Expense by category */}
      {expByCategory.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Expenses by Category</h3>
          <div className="flex flex-col gap-3">
            {expByCategory.map(({ name, value }, i) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{fmt(value)}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(value / expense) * 100}%`, background: EXPENSE_PALETTE[i % EXPENSE_PALETTE.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar chart 6 months */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Income vs Expenses</h3>
        <p className="text-xs text-slate-400 mb-3">Last 6 months</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} barSize={10} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: labelColor }} axisLine={{ stroke: axisColor }} tickLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={(v) => fmt(Number(v))}
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBdr}`, borderRadius: 10, fontSize: 12 }}
            />
            <Bar dataKey="Income"  fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="Expense" fill="#ef4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {[['Income','#10b981'],['Expense','#ef4444']].map(([l,c]) => (
            <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
