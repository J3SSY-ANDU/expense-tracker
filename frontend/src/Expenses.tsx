import { useState } from "react";
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Category, Expense, User, History as MonthlyHistory } from "./types";
import { useNavigate } from "react-router-dom";
import { Categories, ExpensesTable, Account, History } from "./components";
// import expense_tracker from "./expense-tracker.svg";
import apiService from "./api/apiService";

export default function Expenses() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null); // State for fetched data
  const [history, setHistory] = useState<MonthlyHistory[] | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [updatingDataError, setUpdatingDataError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrors(null);
      try {
        // Fetch all data
        const [categoriesData, expensesData, historyData] = await Promise.all([
          apiService.getCategoriesData(),
          apiService.getExpensesData(),
          apiService.getHistoryData()
        ]);
  
        if ((!categoriesData || "error" in categoriesData) || (!expensesData || "error" in expensesData) || (!historyData || "error" in historyData)) {
          setErrors("Failed to fetch data.");
          navigate("/login");
          return;
        }
  
        setCategories(categoriesData);
        setExpenses(expensesData);
        setHistory(historyData);
  
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors("Something went wrong while fetching data. Please try again later.");
        setLoading(false);
        return;
      }
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
      const [expensesData, categoriesData, historyData] = await Promise.all([
        apiService.getExpensesData(),
        apiService.getCategoriesData(),
        apiService.getHistoryData()
      ]);

      if ((!expensesData || "error" in expensesData) || (!categoriesData || "error" in categoriesData) || (!historyData || "error" in historyData)) {
        console.error("Failed to fetch updated data.");
        setUpdatingDataError("Failed to fetch updated data.");
        return;
      }
      setExpenses(expensesData);
      setCategories(categoriesData);
      setHistory(historyData);
    } catch (error) {
      console.error("Error updating expense:", error);
      setUpdatingDataError("Failed to update expense. Please try again later.");
      return;
    }
  }

  return (
    <Box
      className="App"
      sx={{
        paddingX: "4rem",
        display: "flex",
        flexDirection: "column",
        gap: "3rem",
      }}
    >
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
      {/* <Box
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
      </Box> */}
      <Categories
        categories={categories}
        setCategories={setCategories}
        expenses={expenses}
        setExpenses={setExpenses}
        setHistory={setHistory}
        handleUpdateData={handleUpdateData}
      />
      <ExpensesTable
        expenses={expenses}
        setExpenses={setExpenses}
        categories={categories}
        setCategories={setCategories}
        setHistory={setHistory}
        handleUpdateData={handleUpdateData}
        mode="monthly"
        title={"Monthly Expenses"}
      />
      <History history={history} setHistory={setHistory} handleUpdateData={handleUpdateData} />
    </Box>
  );
}
