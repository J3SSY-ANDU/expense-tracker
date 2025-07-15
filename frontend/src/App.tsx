import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Category, Expense, User, History as MonthlyHistory } from "./types";
import { useNavigate } from "react-router-dom";
import { Categories, ExpensesTable, Account, History } from "./components";
import expense_tracker from "./expense-tracker.svg";
import apiService from "./api/apiService";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null); // State for fetched data
  const [history, setHistory] = useState<MonthlyHistory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await apiService.getUserData();
      if (!userData) {
        navigate("/login");
        return;
      }
      setUser(userData);

      const categoriesData = await apiService.getCategoriesData();
      setCategories(categoriesData);

      const expensesData = await apiService.getExpensesData();
      setExpenses(expensesData);

      const historyData = await apiService.getHistoryData();
      setHistory(historyData);
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleUpdateData = async (updatedExpense: Expense): Promise<void> => {
    if (!updatedExpense) return;
    try {
      const updated = await apiService.updateExpense(updatedExpense);
      if (updated && "error" in updated) {
        console.error(`Error updating expense: ${updated.error}`);
        // Add any additional error handling here if needed


        return;
      }
      // Fetch updated data after successful update
      const expensesData = await apiService.getExpensesData();
      setExpenses(expensesData);
      const categoriesData = await apiService.getCategoriesData();
      setCategories(categoriesData);
      const historyData = await apiService.getHistoryData();
      setHistory(historyData);
    } catch (error) {
      console.error("Error updating expense:", error);
      // Add any additional error handling here if needed
      return;
    }
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
        handleUpdateData={handleUpdateData}
      />
      <ExpensesTable
        user={user}
        expenses={expenses}
        setExpenses={setExpenses}
        categories={categories}
        setCategories={setCategories}
        setHistory={setHistory}
        handleUpdateData={handleUpdateData}
        mode="monthly"
        title={"Monthly Expenses"}
      />
      <History history={history} setHistory={setHistory} user={user} handleUpdateData={handleUpdateData} />
    </Box>
  );
}
