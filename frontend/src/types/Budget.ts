export interface Budget {
    id: string;
    user_id: string;
    month: number;
    year: number;
    total_income: number | string;
    total_expenses: number | string;
}