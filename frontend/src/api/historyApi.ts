import { History as MonthlyHistory } from "../types";

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