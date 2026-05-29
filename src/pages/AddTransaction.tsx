import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Plus, X, Trash2 } from 'lucide-react';
import { useFinance } from '../store/useFinance';
import { useCategories } from '../store/useCategories';
import type { Transaction, TxType } from '../types';

const TYPE_STYLE: Record<TxType, { active: string; saveBtn: string }> = {
  income:     { active: 'bg-emerald-600 text-white border-emerald-600', saveBtn: 'bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900' },
  expense:    { active: 'bg-red-500     text-white border-red-500',     saveBtn: 'bg-red-500     shadow-red-200     dark:shadow-red-900'     },
  investment: { active: 'bg-blue-700   text-white border-blue-700',     saveBtn: 'bg-blue-700   shadow-blue-200    dark:shadow-blue-900'    },
};

export default function AddTransaction() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const editTx    = location.state?.tx as Transaction | undefined;
  const isEditing = !!editTx;

  const { addTransaction, updateTransaction } = useFinance();
  const { getAll, addCategory, deleteCategory, custom } = useCategories();

  const [type, setType]             = useState<TxType>(editTx?.type     ?? 'expense');
  const [category, setCategory]     = useState<string>(editTx?.category ?? 'Food');
  const [amount, setAmount]         = useState(editTx ? String(editTx.amount) : '');
  const [note, setNote]             = useState(editTx?.note             ?? '');
  const [date, setDate]             = useState(editTx?.date             ?? new Date().toISOString().slice(0, 10));
  const [addingCat, setAddingCat]   = useState(false);
  const [newCatName, setNewCatName] = useState('');

  function handleTypeChange(t: TxType) {
    setType(t);
    setCategory(getAll(t)[0]);
    setAddingCat(false);
  }

  function handleSave() {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    if (isEditing) {
      updateTransaction({ ...editTx!, type, category, amount: n, note, date });
    } else {
      addTransaction({ type, category, amount: n, note, date });
    }
    navigate(-1);
  }

  function handleAddCat() {
    if (!newCatName.trim()) return;
    addCategory(type, newCatName.trim());
    setCategory(newCatName.trim());
    setNewCatName('');
    setAddingCat(false);
  }

  const s = TYPE_STYLE[type];
  const allCategories  = getAll(type);
  const customForType  = custom[type] || [];

  return (
    <div className="page-enter pb-10 bg-slate-50 dark:bg-slate-900 min-h-dvh">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
        {isEditing && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
            Editing
          </span>
        )}
      </div>

      <div className="px-4 flex flex-col gap-5">
        {/* Type tabs */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
          {(['expense', 'income', 'investment'] as TxType[]).map(t => (
            <button key={t} onClick={() => handleTypeChange(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${type === t ? TYPE_STYLE[t].active : 'text-slate-500 dark:text-slate-400'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-2">Amount</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-400">₹</span>
            <input type="number" inputMode="decimal" placeholder="0" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 text-3xl font-bold text-slate-800 dark:text-slate-100 outline-none bg-transparent placeholder:text-slate-200 dark:placeholder:text-slate-600" />
          </div>
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Category</label>
            <button onClick={() => { setAddingCat(v => !v); setNewCatName(''); }}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
              {addingCat ? <><X size={12} /> Cancel</> : <><Plus size={12} /> New</>}
            </button>
          </div>

          {addingCat && (
            <div className="flex gap-2 mb-3">
              <input autoFocus type="text" placeholder="Category name..." value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCat()}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" />
              <button onClick={handleAddCat}
                className={`px-4 py-2 rounded-xl text-white text-sm font-semibold ${type === 'income' ? 'bg-emerald-600' : type === 'expense' ? 'bg-red-500' : 'bg-blue-700'}`}>
                Add
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {allCategories.map(c => {
              const isCustom = customForType.includes(c);
              return (
                <div key={c} className="flex items-center">
                  <button onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      category === c ? s.active : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    } ${isCustom ? 'rounded-r-none border-r-0' : ''}`}>
                    {c}
                  </button>
                  {isCustom && (
                    <button onClick={() => { deleteCategory(type, c); if (category === c) setCategory(getAll(type)[0]); }}
                      className="px-1.5 py-1.5 rounded-r-full border border-l-0 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-300 hover:text-red-400 transition-colors h-full">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-2">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full text-sm text-slate-700 dark:text-slate-200 outline-none bg-transparent" />
        </div>

        {/* Note */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-2">Note (optional)</label>
          <input type="text" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)}
            className="w-full text-sm text-slate-700 dark:text-slate-200 outline-none bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600" />
        </div>

        {/* Save / Update */}
        <button onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 shadow-lg ${s.saveBtn}`}>
          <Check size={18} />
          {isEditing ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </div>
  );
}
