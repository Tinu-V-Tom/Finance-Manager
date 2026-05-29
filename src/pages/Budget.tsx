import { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { useFinance, filterMonth, fmt, monthKey } from '../store/useFinance';

const CATEGORIES = [
  'Total', 'Food', 'Transport', 'Shopping', 'Bills',
  'Entertainment', 'Health', 'Education', 'Other',
];

export default function Budget() {
  const { budgets, transactions, upsertBudget, deleteBudget } = useFinance();
  const [selected, setSelected]     = useState('Total');
  const [amount, setAmount]         = useState('');
  const [confirmCat, setConfirmCat] = useState<string | null>(null);

  const mk      = monthKey();
  const monthly = useMemo(() => filterMonth(transactions, mk), [transactions, mk]);

  function getSpent(cat: string) {
    if (cat === 'Total') return monthly.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    return monthly.filter(t => t.type === 'expense' && t.category === cat).reduce((a, t) => a + t.amount, 0);
  }

  function handleSet() {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    upsertBudget({ category: selected, limit: n });
    setAmount('');
  }

  function handleSelectCat(c: string) {
    setSelected(c);
    const existing = budgets.find(b => b.category === c);
    setAmount(existing ? String(existing.limit) : '');
  }

  return (
    <div className="page-enter pb-24 px-4 pt-6">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Budget</h1>
      <p className="text-sm text-slate-400 mb-5">Set monthly spending limits.</p>

      {/* Category picker */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(c => {
          const hasBudget = budgets.some(b => b.category === c);
          return (
            <button
              key={c}
              onClick={() => handleSelectCat(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selected === c
                  ? 'bg-blue-700 text-white border-blue-700'
                  : hasBudget
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Amount input */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-3">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-2">
          Limit for "{selected}"
        </label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-400">₹</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 text-3xl font-bold text-slate-800 dark:text-slate-100 outline-none bg-transparent placeholder:text-slate-200 dark:placeholder:text-slate-600"
          />
        </div>
      </div>

      <button
        onClick={handleSet}
        disabled={!amount || parseFloat(amount) <= 0}
        className="w-full py-4 rounded-2xl bg-blue-700 text-white font-bold text-sm mb-8 shadow-lg shadow-blue-200 dark:shadow-blue-900 active:scale-95 transition-all disabled:opacity-40"
      >
        Set Budget
      </button>

      {/* Budget cards */}
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">This Month's Status</h2>

      {budgets.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">No budgets set yet.</div>
      )}

      <div className="flex flex-col gap-3">
        {CATEGORIES.filter(c => budgets.some(b => b.category === c)).map(cat => {
          const budget = budgets.find(b => b.category === cat)!;
          const spent  = getSpent(cat);
          const pct    = Math.min((spent / budget.limit) * 100, 100);
          const over   = spent > budget.limit;
          const diff   = Math.abs(budget.limit - spent);

          return (
            <div
              key={cat}
              className={`rounded-2xl border p-4 ${over ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${over ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400'}`}>
                    {over ? '▲ OVER' : '✓ OK'}
                  </span>
                  <button onClick={() => setConfirmCat(cat)} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Spent {fmt(spent)} of {fmt(budget.limit)}</span>
                <span className={over ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400'}>
                  {over ? `${fmt(diff)} over` : `${fmt(diff)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirm */}
      {confirmCat && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-[480px] p-5">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Remove "{confirmCat}" budget?</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirmCat(null)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Cancel
              </button>
              <button
                onClick={() => { deleteBudget(confirmCat); setConfirmCat(null); }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
