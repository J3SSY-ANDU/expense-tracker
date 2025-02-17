import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Category, Expense, History as MonthlyHistory, User } from "../types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { FetchHistoryExpensesByMonthYear, GetCategory } from "../api";
import { ExpensesTable } from "./ExpensesTable";

export function History({
  user,
  history,
  setHistory,
}: {
  user: User | null;
  history: MonthlyHistory[] | null;
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>;
}) {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const handleAccordionToggle = async (
    id: string,
    month: number,
    year: number
  ) => {
    if (expandedAccordion === id) {
      // Close the currently expanded accordion
      setExpandedAccordion(null);
      setExpenses(null); // Clear the expenses when closing
    } else {
      // Expand the clicked accordion
      setExpandedAccordion(id);
      setLoading(false);
      try {
        const expensesByMonthYear = await FetchHistoryExpensesByMonthYear(
          month,
          year
        );
        setExpenses(expensesByMonthYear);
        if (expensesByMonthYear && expensesByMonthYear[0]) {
          const categoryIds = expensesByMonthYear.map(
            (expense) => expense.category_id
          );
          const categoriesData = await Promise.all(
            categoryIds.map((categoryId) => GetCategory(categoryId))
          );
          setCategories(
            () =>
              categoriesData.filter(
                (category) => category !== null
              ) as Category[]
          );
        }
      } catch (err) {
        console.error(`Error fetching history data: ${err}`);
      }
    }
  };

  if (!history || !history[0]) {
    console.log("history:", history);
    return;
  } else {
    return (
      <div>
        <h2>History</h2>
        {history.map((monthlyHistory: MonthlyHistory) => {
          return (
            <Accordion
              key={monthlyHistory.id}
              expanded={expandedAccordion === monthlyHistory.id}
              elevation={0}
              sx={{ zIndex: 0 }}
              onChange={() =>
                handleAccordionToggle(
                  monthlyHistory.id,
                  monthlyHistory.month,
                  monthlyHistory.year
                )
              }
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h3>{monthlyHistory.name}</h3>
              </AccordionSummary>
              <AccordionDetails>
                {!loading ? (
                  <ExpensesTable
                    user={user}
                    expenses={expenses}
                    setExpenses={setExpenses}
                    categories={categories}
                    setCategories={setCategories}
                    setHistory={setHistory}
                    mode="category"
                    title=""
                  />
                ) : (
                  <div>Loading...</div>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    );
  }
}
