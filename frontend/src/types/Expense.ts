export interface Expense {
  id: string;
  name: string;
  user_id: string;
  amount: number | string;
  category_id: string;
  date: Date;
  notes: string;
}

export interface NewExpense {
  name: string;
  user_id: string;
  amount: number | string;
  category_id: string;
  date: string;
  notes: string;
}
