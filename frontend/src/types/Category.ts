export interface Category {
    id: string;
    user_id: string;
    name: string;
    total_expenses: number | string;
    description: string;
  }

export interface NewCategory {
    name: string;
    user_id: string;
    total_expenses: number;
    description: string;
}