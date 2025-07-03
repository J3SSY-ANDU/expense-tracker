import { History as MonthlyHistory } from "../types";

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