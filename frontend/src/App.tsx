import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Category, Expense, User, History as MonthlyHistory } from "./types";
import { useNavigate } from "react-router-dom";
import {
  FetchCategoriesData,
  FetchExpensesData,
  FetchUserData,
  FetchHistoryData,
  GenerateCategoryData,
} from "./api";
import { Categories, ExpensesTable, Account, History } from "./components";
import expense_tracker from "./expense-tracker.svg";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null); // State for fetched data
  const [history, setHistory] = useState<MonthlyHistory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await FetchUserData();
      if (!userData) {
        navigate("/login");
        return;
      }
      setUser(userData);

      await GenerateCategoryData(); // Ensure categories are generated for the user
      
      const categoriesData = await FetchCategoriesData();
      setCategories(categoriesData);
      
      const expensesData = await FetchExpensesData();
      setExpenses(expensesData);
      
      const historyData = await FetchHistoryData();
      setHistory(historyData);
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleUpdateHistory = (updatedExpense: Expense, oldExpense: Expense) => {
    function getMonthAndYear(date: string) {
      const d = new Date(date);
      return {
        month: d.getMonth() + 1, // Months are 0-indexed
        year: d.getFullYear(),
      };
    }
    const updatedExpenseMonthYear = getMonthAndYear(updatedExpense.date.toString());
    const oldExpenseMonthYear = getMonthAndYear(oldExpense.date.toString());
    const currentMonthYear = getMonthAndYear(new Date().toString());

    setHistory((prev) => {
      if (!prev) return prev;
      // Find the MonthlyHistory for the updated expense
      const oldHistoryIndex = prev.findIndex(
        (history) =>
          history.month === oldExpenseMonthYear.month &&
          history.year === oldExpenseMonthYear.year
      );

      const updatedHistoryIndex = prev.findIndex(
        (history) =>
          history.month === updatedExpenseMonthYear.month &&
          history.year === updatedExpenseMonthYear.year
      );

      if (oldHistoryIndex === -1 && updatedHistoryIndex === -1) {
        // No history for either old or updated expense's month/year
        return prev;
      } else if (oldHistoryIndex !== -1 && updatedHistoryIndex === -1) {
        // Old history exists, updated history does not (moved to a new month/year)
        const oldHistory = prev[oldHistoryIndex];

        // Remove oldExpense from oldHistory
        const filteredExpenses = oldHistory.expenses.filter(
          (expense) => expense.id !== oldExpense.id
        );
        // Update category totals and remove category if needed
        const updatedCategories = oldHistory.categories.map((cat) =>
          cat.id === oldExpense.category_id
            ? {
              ...cat,
              total_expenses: (
                Number(cat.total_expenses) - Number(oldExpense.amount)
              ).toFixed(2),
            }
            : cat
        ).filter((cat) => Number(cat.total_expenses) > 0);

        setExpenses((prev) => {
          if (!prev) return [updatedExpense];

          // Find the updated category name
          const updatedCategoryName = oldHistory.categories?.find(
            c => c.id === updatedExpense.category_id
          )?.name;

          const newCategory = categories?.find(
            (cat) => cat.name === updatedCategoryName
          );

          updatedExpense.category_id = newCategory?.id || updatedExpense.category_id;
          
          console.log("updatedCategoryName", updatedCategoryName);
          console.log("newCategory", newCategory);
          console.log("updatedExpense", updatedExpense);

          console.log("categories", categories);

          // Add updatedExpense
          return [updatedExpense, ...prev.filter((expense) => expense.id !== oldExpense.id)];
        });

        setCategories((prev) => {
          if (!prev) return prev;
          // Update updated expense's category
          const updatedCatIdx = prev.findIndex(
            (cat) => cat.name === (oldHistory.categories?.find(c => c.id === updatedExpense.category_id)?.name)
          );

          if (updatedCatIdx !== -1) {
            // Update existing category
            return prev.map((cat, idx) =>
              idx === updatedCatIdx
                ? {
                  ...cat,
                  total_expenses: (
                    Number(cat.total_expenses) +
                    Number(updatedExpense.amount)
                  ).toFixed(2),
                }
                : cat
            );
          } else {
            // Add new category
            const newCat = categories?.find(
              (cat) => cat.id === updatedExpense.category_id
            );
            if (newCat) {
              return [
                { ...newCat, total_expenses: updatedExpense.amount },
                ...prev,
              ];
            }
            return prev;
          }
        })

        const updatedOldHistory: MonthlyHistory = {
          ...oldHistory,
          expenses: filteredExpenses,
          categories: updatedCategories,
          total_expenses: Number(oldHistory.total_expenses) - Number(oldExpense.amount),
        };

        // If no expenses left, remove the history entry
        const newPrev = filteredExpenses.length === 0
          ? prev.filter((_, idx) => idx !== oldHistoryIndex)
          : prev.map((h, i) => (i === oldHistoryIndex ? updatedOldHistory : h));

        // Optionally, you could create a new history for the updatedExpense's month/year here if needed

        return newPrev;
      } else if (oldHistoryIndex === -1 && updatedHistoryIndex !== -1) {
        // Old history does not exist, but updated history does (moved from a new month/year)
        const updatedHistory = prev[updatedHistoryIndex];

        // Add updatedExpense to updatedHistory
        const newExpenses = [updatedExpense, ...updatedHistory.expenses];
        // Update or add category
        const catIdx = updatedHistory.categories.findIndex(
          (cat) => cat.id === updatedExpense.category_id
        );
        let newCategories;
        if (catIdx !== -1) {
          newCategories = updatedHistory.categories.map((cat, idx) =>
            idx === catIdx
              ? {
                ...cat,
                total_expenses: (
                  Number(cat.total_expenses) + Number(updatedExpense.amount)
                ).toFixed(2),
              }
              : cat
          );
        } else {
          const newCat = categories?.find((cat) => cat.id === updatedExpense.category_id);
          if (newCat) {
            newCategories = [
              { ...newCat, total_expenses: Number(updatedExpense.amount).toFixed(2) },
              ...updatedHistory.categories,
            ];
          } else {
            newCategories = updatedHistory.categories;
          }
        }

        const updatedUpdatedHistory: MonthlyHistory = {
          ...updatedHistory,
          expenses: newExpenses,
          categories: newCategories,
          total_expenses: Number(updatedHistory.total_expenses) + Number(updatedExpense.amount),
        };

        return prev.map((h, i) => (i === updatedHistoryIndex ? updatedUpdatedHistory : h));
      } else {
        // Both old and updated histories exist (could be the same or different)
        const oldHistory = prev[oldHistoryIndex];
        const updatedHistory = prev[updatedHistoryIndex];

        // Remove oldExpense from oldHistory
        const filteredOldExpenses = oldHistory.expenses.filter(
          (expense) => expense.id !== oldExpense.id
        );
        const updatedOldCategories = oldHistory.categories.map((cat) =>
          cat.id === oldExpense.category_id
            ? {
              ...cat,
              total_expenses: (
                Number(cat.total_expenses) - Number(oldExpense.amount)
              ).toFixed(2),
            }
            : cat
        ).filter((cat) => Number(cat.total_expenses) > 0);

        const updatedOldHistory: MonthlyHistory = {
          ...oldHistory,
          expenses: filteredOldExpenses,
          categories: updatedOldCategories,
          total_expenses: Number(oldHistory.total_expenses) - Number(oldExpense.amount),
        };

        // Add updatedExpense to updatedHistory
        const newUpdatedExpenses = [updatedExpense, ...updatedHistory.expenses];
        const catIdx = updatedHistory.categories.findIndex(
          (cat) => cat.id === updatedExpense.category_id
        );
        let newUpdatedCategories;
        if (catIdx !== -1) {
          newUpdatedCategories = updatedHistory.categories.map((cat, idx) =>
            idx === catIdx
              ? {
                ...cat,
                total_expenses: (
                  Number(cat.total_expenses) + Number(updatedExpense.amount)
                ).toFixed(2),
              }
              : cat
          );
        } else {
          const newCat = categories?.find((cat) => cat.id === updatedExpense.category_id);
          if (newCat) {
            newUpdatedCategories = [
              { ...newCat, total_expenses: Number(updatedExpense.amount).toFixed(2) },
              ...updatedHistory.categories,
            ];
          } else {
            newUpdatedCategories = updatedHistory.categories;
          }
        }

        const updatedUpdatedHistory: MonthlyHistory = {
          ...updatedHistory,
          expenses: newUpdatedExpenses,
          categories: newUpdatedCategories,
          total_expenses: Number(updatedHistory.total_expenses) + Number(updatedExpense.amount),
        };

        // Remove oldHistory if no expenses left
        let result = prev.map((h, i) => {
          if (i === oldHistoryIndex) return updatedOldHistory;
          if (i === updatedHistoryIndex) return updatedUpdatedHistory;
          return h;
        });
        if (filteredOldExpenses.length === 0) {
          result = result.filter((_, idx) => idx !== oldHistoryIndex);
        }
        return result;
      }
    })
  }

  return (
    <Box
      className="App"
      sx={{
        padding: "2rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "3rem",
      }}
    >
      <Account user={user} setUser={setUser} />
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <Typography fontSize={24}>Hi {user?.firstname},</Typography>
        <Typography fontSize={24}>
          Welcome to my Expense Tracker Project!
        </Typography>
      </Box> */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <img
          src={expense_tracker}
          alt="Expense tracker icon"
          width={43}
          height={31}
        />
        <Typography fontSize={32} fontWeight={"bold"}>
          Expense Tracker
        </Typography>
      </Box>
      <Categories
        user={user}
        categories={categories}
        setCategories={setCategories}
        expenses={expenses}
        setExpenses={setExpenses}
        setHistory={setHistory}
      />
      <ExpensesTable
        user={user}
        expenses={expenses}
        setExpenses={setExpenses}
        categories={categories}
        setCategories={setCategories}
        setHistory={setHistory}
        mode="monthly"
        title={"Monthly Expenses"}
      />
      <History history={history} setHistory={setHistory} user={user} handleUpdateHistory={handleUpdateHistory} />
    </Box>
  );
}
