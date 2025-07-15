import { History as MonthlyHistory } from "../types";
import { api } from "./apiService";

export async function FetchHistoryData(): Promise<MonthlyHistory[] | null> {
  try {
    const res = await api.get("/history");
    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.error(`Error fetching history data ${err}`);
  }
  return null;
}