import { Expense } from "../types/Expense";

export async function FetchExpensesData(): Promise<Expense[] | null> {
    try {
      const res = await fetch("/all-expenses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200) {
        const expensesData: Expense[] = await res.json(); // Make sure that the response is of type Expense[]
        return expensesData;
      }
    } catch (err) {
      console.error(`Error fetching expenses data ${err}`);
    }
    return null;
  }