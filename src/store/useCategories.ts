import { useState, useEffect } from 'react';
import type { TxType } from '../types';

export const PREDEFINED: Record<TxType, string[]> = {
  income:     ['Salary', 'Freelance', 'Business', 'Rental', 'Other'],
  expense:    ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
  investment: ['Stocks', 'Mutual Funds', 'Crypto', 'Real Estate', 'Fixed Deposit', 'Other'],
};

type CustomMap = Record<TxType, string[]>;

function loadCustom(): CustomMap {
  try {
    const raw = localStorage.getItem('ft_custom_cats');
    return raw ? JSON.parse(raw) : { income: [], expense: [], investment: [] };
  } catch {
    return { income: [], expense: [], investment: [] };
  }
}

let _custom: CustomMap = loadCustom();
let _listeners: (() => void)[] = [];
function notify() { _listeners.forEach(f => f()); }

export function useCategories() {
  const [custom, setCustom] = useState<CustomMap>(_custom);

  useEffect(() => {
    const fn = () => setCustom({ ..._custom });
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(f => f !== fn); };
  }, []);

  function getAll(type: TxType): string[] {
    return [...PREDEFINED[type], ...(_custom[type] || [])];
  }

  function addCategory(type: TxType, name: string) {
    const trimmed = name.trim();
    if (!trimmed || _custom[type].includes(trimmed) || PREDEFINED[type].includes(trimmed)) return;
    _custom = { ..._custom, [type]: [..._custom[type], trimmed] };
    localStorage.setItem('ft_custom_cats', JSON.stringify(_custom));
    notify();
  }

  function deleteCategory(type: TxType, name: string) {
    _custom = { ..._custom, [type]: _custom[type].filter(c => c !== name) };
    localStorage.setItem('ft_custom_cats', JSON.stringify(_custom));
    notify();
  }

  return { custom, getAll, addCategory, deleteCategory };
}
