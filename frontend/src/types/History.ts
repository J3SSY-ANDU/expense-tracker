import { Expense, Category } from "./index";

export interface History {
    id: string;
    name: string;
    user_id: string;
    month: number;
    year: number;
    total_expenses: number;
    expenses: Expense[];
    categories: Category[];
}