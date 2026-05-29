export type TxType = 'income' | 'expense' | 'investment';

export type Category =
  // expense
  | 'Food' | 'Transport' | 'Shopping' | 'Bills'
  | 'Entertainment' | 'Health' | 'Education'
  // income
  | 'Salary' | 'Freelance' | 'Business' | 'Rental'
  // investment
  | 'Stocks' | 'Mutual Funds' | 'Crypto' | 'Real Estate' | 'Fixed Deposit'
  | 'Other';

export interface Transaction {
  id: string;
  type: TxType;
  category: Category;
  amount: number;
  note: string;
  date: string; // "YYYY-MM-DD"
}

export interface Budget {
  category: string; // Category or "Total"
  limit: number;
}
