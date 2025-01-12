import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { History as MonthlyHistory } from "../types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ExpensesTable } from "./ExpensesTable";

export function History({
  history,
  setHistory,
}: {
  history: MonthlyHistory[] | null;
  setHistory: (history: MonthlyHistory[]) => void;
}) {
  if (!history) {
    return;
  }
  return (
    <div>
      <h2>History</h2>
      {history.map((monthlyHistory: MonthlyHistory) => {
        return (
          <Accordion key={monthlyHistory.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <h3>{monthlyHistory.month}</h3>
            </AccordionSummary>
            <AccordionDetails>
              <h3>Here goes the table</h3>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
