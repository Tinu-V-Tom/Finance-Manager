export type TxType = 'income' | 'expense' | 'investment';

export type Category = string; // predefined + user-defined

export interface Transaction {
  id: string;
  type: TxType;
  category: Category;
  amount: number;
  note: string;
  date: string; // "YYYY-MM-DD"
}

export interface Budget {
  category: string;
  limit: number;
}

export type Recurrence = 'once' | 'weekly' | 'monthly' | 'yearly';

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;    // "YYYY-MM-DD" — next due date
  recurrence: Recurrence;
  note: string;
}
