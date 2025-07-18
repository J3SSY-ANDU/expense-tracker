export interface Category {
    id: string;
    name: string;
    total_expenses: number | string;
    description: string;
    order: number;
  }

export interface NewCategory {
    name: string;
    month: number;
    year: number;
    total_expenses: number;
    description: string;
}