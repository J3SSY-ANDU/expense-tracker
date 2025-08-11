export interface Category {
    id: string;
    name: string;
    budget: number | string;
    total_expenses: number | string;
    description: string;
    order: number;
    icon: string;
  }

export interface NewCategory {
    name: string;
    month: number;
    year: number;
    budget: number;
    total_expenses: number;
    description: string;
    icon: string;
}