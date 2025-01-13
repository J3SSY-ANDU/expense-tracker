import { History as MonthlyHistory, Expense } from "../types";

export async function FetchHistoryData(): Promise<MonthlyHistory[] | null> {
  try {
    const res = await fetch("/history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (res.status === 200) {
      const historyData: MonthlyHistory[] = await res.json();
      return historyData;
    }
  } catch (err) {
    console.error(`Error fetching history data ${err}`);
  }
  return null;
}

export async function FetchHistoryExpensesByMonthYear(month: number, year: number): Promise<Expense[] | null> {
  try {
    const res = await fetch(`/monthly-history?month=${month}&year=${year}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (res.status === 200) {
      const historyData: Expense[] = await res.json();
      return historyData;
    }
  } catch (err) {
    console.error(`Error fetching history data ${err}`);
  }
  return null;
}