import { History as MonthlyHistory, Expense } from "../types";

const token = localStorage.getItem("authToken");
export async function FetchHistoryData(): Promise<MonthlyHistory[] | null> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/history`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
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
    const res = await fetch(`${process.env.REACT_APP_API_URL}/monthly-history?month=${month}&year=${year}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json",
      },
      credentials: "include",
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