export interface Expense {
  id: string;
  name: string;
  amount: number | string;
  category_id: string;
  date: Date;
  notes: string;
}

export interface NewExpense {
  name: string;
  amount: number | string;
  category_id: string;
  date: string;
  notes: string;
}
