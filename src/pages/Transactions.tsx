import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import { useFinance, fmt, fmtDate, sortByDate } from '../store/useFinance';
import type { TxType } from '../types';

const FILTERS = ['All', 'Income', 'Expense', 'Investment'] as const;

const TYPE_STYLE: Record<TxType, { bar: string; amount: string; bg: string }> = {
  income:     { bar: 'bg-emerald-400', amount: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900' },
  expense:    { bar: 'bg-red-400',     amount: 'text-red-500',     bg: 'bg-red-50     dark:bg-red-950     border-red-100     dark:border-red-900'     },
  investment: { bar: 'bg-blue-400',    amount: 'text-blue-500',    bg: 'bg-blue-50    dark:bg-blue-950    border-blue-100    dark:border-blue-900'    },
};

export default function Transactions() {
  const navigate = useNavigate();
  const { transactions, deleteTransaction } = useFinance();
  const [filter, setFilter]       = useState<typeof FILTERS[number]>('All');
  const [search, setSearch]       = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = sortByDate(transactions);
    return base
      .filter(t => filter === 'All' || t.type === filter.toLowerCase())
      .filter(t => !search ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.note.toLowerCase().includes(search.toLowerCase())
      );
  }, [transactions, filter, search]);

  return (
    <div className="page-enter pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Transactions</h1>
          <Link to="/add" className="bg-blue-700 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900 active:scale-95 transition-transform">
            <Plus size={18} />
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 mb-3">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search category or note..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-slate-700 dark:text-slate-200 outline-none bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? 'bg-blue-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No transactions found.</div>
        ) : (
          filtered.map(t => {
            const s = TYPE_STYLE[t.type];
            return (
              <div key={t.id} className={`flex items-center rounded-2xl overflow-hidden border ${s.bg}`}>
                <div className={`w-1 self-stretch shrink-0 ${s.bar}`} />
                <div className="flex-1 flex items-center gap-3 px-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{t.category}</p>
                    {t.note && <p className="text-xs text-slate-400 truncate">{t.note}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {fmtDate(t.date)} · <span className="capitalize">{t.type}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <p className={`text-sm font-bold mr-1 ${s.amount}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </p>
                    {/* Edit */}
                    <button
                      onClick={() => navigate('/add', { state: { tx: t } })}
                      className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setConfirmId(t.id)}
                      className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete confirm */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-[480px] p-5">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Delete transaction?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Cancel
              </button>
              <button onClick={() => { deleteTransaction(confirmId); setConfirmId(null); }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
