import { useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget, TxType } from '../types';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

let txListeners: (() => void)[] = [];
let bdListeners: (() => void)[] = [];
let _transactions: Transaction[] = load('ft_tx', []);
let _budgets: Budget[] = load('ft_bd', []);

function notifyTx() { txListeners.forEach(fn => fn()); }
function notifyBd() { bdListeners.forEach(fn => fn()); }

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>(_transactions);
  const [budgets, setBudgets] = useState<Budget[]>(_budgets);

  useEffect(() => {
    const onTx = () => setTransactions([..._transactions]);
    const onBd = () => setBudgets([..._budgets]);
    txListeners.push(onTx);
    bdListeners.push(onBd);
    return () => {
      txListeners = txListeners.filter(f => f !== onTx);
      bdListeners = bdListeners.filter(f => f !== onBd);
    };
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const tx: Transaction = { ...t, id: Date.now().toString(36) + Math.random().toString(36).slice(2) };
    _transactions = [tx, ..._transactions];
    save('ft_tx', _transactions);
    notifyTx();
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    _transactions = _transactions.filter(t => t.id !== id);
    save('ft_tx', _transactions);
    notifyTx();
  }, []);

  const upsertBudget = useCallback((b: Budget) => {
    _budgets = [b, ..._budgets.filter(x => x.category !== b.category)];
    save('ft_bd', _budgets);
    notifyBd();
  }, []);

  const deleteBudget = useCallback((category: string) => {
    _budgets = _budgets.filter(b => b.category !== category);
    save('ft_bd', _budgets);
    notifyBd();
  }, []);

  return { transactions, budgets, addTransaction, deleteTransaction, upsertBudget, deleteBudget };
}

// Helpers
export function sumByType(txs: Transaction[], type: TxType) {
  return txs.filter(t => t.type === type).reduce((a, t) => a + t.amount, 0);
}

export function filterMonth(txs: Transaction[], key: string) {
  return txs.filter(t => t.date.startsWith(key));
}

export function monthKey(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

export function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
