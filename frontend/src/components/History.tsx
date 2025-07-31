import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Category, Expense, History as MonthlyHistory } from "../types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import { ExpensesTable } from "./ExpensesTable";

export function History({
  history,
  setHistory,
  handleUpdateData,
}: {
  history: MonthlyHistory[] | null;
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
  handleUpdateData: (
    updatedExpense: Expense,
  ) => Promise<void>;
}) {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!history || !expandedAccordion) return;
    const expandedMonth = history.find(h => h.id === expandedAccordion);
    if (expandedMonth) {
      setExpenses(expandedMonth.expenses);
      setCategories(expandedMonth.categories);
      setLoading(false);
    }
  }, [history, expandedAccordion]);

  const handleAccordionToggle = async (
    id: string,
  ) => {
    if (expandedAccordion === id) {
      // Close the currently expanded accordion
      setExpandedAccordion(null);
      setLoading(true)
      setExpenses(null); // Clear the expenses when closing
      setCategories(null); // Clear the categories when closing
    } else if (expandedAccordion) {
      // Another accordion is open, close it first, then open the new one after a delay
      setExpandedAccordion(null);
      setLoading(false);
      setExpenses(null);
      setCategories(null);
      setTimeout(() => {
        setExpandedAccordion(id);
      }, 200);
    } else {
      // No accordion is open, open the new one immediately
      setExpandedAccordion(id);
      setLoading(false);
    }
  };

  const isCurrentMonth = (monthlyHistory: MonthlyHistory) =>
    monthlyHistory.month === new Date().getMonth() + 1 &&
    monthlyHistory.year === new Date().getFullYear();

  if (!history || !history[0]) {
    console.log("history:", history);
    return;
  }

  // Filter out the current month
  const pastHistory = history.filter((monthlyHistory: MonthlyHistory) => !isCurrentMonth(monthlyHistory));

  if (pastHistory.length === 0) {
    return null; // No past history to show
  }

  return (
    <div>
      <h2>History</h2>
      {pastHistory.map((monthlyHistory: MonthlyHistory) => (
        <Accordion
          key={monthlyHistory.id}
          expanded={expandedAccordion === monthlyHistory.id}
          elevation={0}
          sx={{ zIndex: 0 }}
          onChange={() =>
            handleAccordionToggle(
              monthlyHistory.id,
            )
          }
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3>{monthlyHistory.name}</h3>
          </AccordionSummary>
          <AccordionDetails>
            {!loading ? (
              <ExpensesTable
                expenses={expenses}
                setExpenses={setExpenses}
                categories={categories}
                setCategories={setCategories}
                setHistory={setHistory}
                handleUpdateData={handleUpdateData}
                mode="history"
                title=""
              />
            ) : (
              <div>Loading...</div>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
