import { Accordion } from "@mui/material";
import { History as MonthlyHistory } from "../types";

export function History({
  history,
  setHistory,
}: {
  history: MonthlyHistory[] | null;
  setHistory: (history: MonthlyHistory[]) => void;
}) {
  return (
    <div>
      <h2>History</h2>
      {history &&
        history.map((month: MonthlyHistory) => {
          return (
            <Accordion>
              <h3>{month.month}</h3>
            </Accordion>
          );
        })}
    </div>
  );
}
